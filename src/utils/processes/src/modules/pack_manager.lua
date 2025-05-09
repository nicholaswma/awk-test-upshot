local authClient = require("lib.auth_client")
local msgHelper = require("lib.msg_helper")
local dataHelper = require("lib.data_helper")
local json = require("json")

local VALID_STATUSES = {"active", "coming soon", "archived"}

local initSQL = [[
CREATE TABLE IF NOT EXISTS packs (
    id INTEGER PRIMARY KEY,
    pack_name TEXT UNIQUE NOT NULL,
    image TEXT,
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'coming soon'
);

CREATE INDEX IF NOT EXISTS idx_pack_status ON packs (status);

CREATE TABLE IF NOT EXISTS pack_categories (
    pack_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (pack_id, category_id),
    FOREIGN KEY (pack_id) REFERENCES packs(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pack_categories_pack_id ON pack_categories (pack_id);
CREATE INDEX IF NOT EXISTS idx_pack_categories_category_id ON pack_categories (category_id);

CREATE TABLE IF NOT EXISTS pack_events (
    pack_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    PRIMARY KEY (pack_id, event_id),
    FOREIGN KEY (pack_id) REFERENCES packs(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_pack_events_pack_id ON pack_events (pack_id);
CREATE INDEX IF NOT EXISTS idx_pack_events_event_id ON pack_events (event_id);
]]

local initSampleData = [[
INSERT INTO packs (id, pack_name, image, description, status)
  VALUES (1, 'Sports pack', 'arweave-tx-hash', 'Pack which draws randomly from all sport related events.', 'active');
INSERT INTO packs (id, pack_name, image, description, status)
  VALUES (2, 'Entertainment pack', 'arweave-tx-hash', 'Pack which draws randomly from all entertainment events.', 'active');
INSERT INTO packs (id, pack_name, image, description, status)
  VALUES (3, 'Politics pack', 'arweave-tx-hash', 'Pack which draws randomly from all political events.', 'active');

INSERT INTO pack_categories (pack_id, category_id) VALUES (1, 1);
INSERT INTO pack_categories (pack_id, category_id) VALUES (2, 2);
INSERT INTO pack_categories (pack_id, category_id) VALUES (3, 3);

INSERT INTO pack_events (pack_id, event_id) VALUES (1, 1);
INSERT INTO pack_events (pack_id, event_id) VALUES (2, 2);
INSERT INTO pack_events (pack_id, event_id) VALUES (3, 3);
]]

local packSchema = {
  id = {
    type = "number",
    transform = tonumber,
    validate = dataHelper.validateId,
  },
  pack_name = {
    type = "string",
    validate = function(val) return dataHelper.validateNotEmpty(val, "pack_name") end
  },
  image = { type = "string" },
  description = {
    type = "string",
    validate = function(val) return dataHelper.validateNotEmpty(val, "description") end
  },
  status = {
    type = "string",
    validate = function(val)
      if not val then
        return false, "status cannot be nil"
      end
      for _, v in ipairs(VALID_STATUSES) do
        if v == val then
          return true
        end
      end
      return false, "status must be one of: " .. table.concat(VALID_STATUSES, ", ")
    end,
    getDefault = function()
      return "coming soon"
    end
  },
  category_ids = {
    type = "table",
    transform = function(val)
      -- Convert string to array if needed
      if type(val) == "string" then
        return json.parse(val)
      -- Convert single number to array
      elseif type(val) == "number" then
        return {val}
      -- Use as is if already array
      elseif type(val) == "table" then
        return val
      end
      return {}
    end,
    validate = function(val)
      if not val then return true end -- Optional field

      if type(val) ~= "table" then
        return false, "category_ids must be an array"
      end

      -- Check if all categories exist
      for _, catId in ipairs(val) do
        local results = DbClient:select("SELECT 1 FROM categories WHERE id = ?", {catId})
        if not results or #results == 0 then
          return false, "Category with ID " .. catId .. " doesn't exist"
        end
      end

      return true
    end
  },
  eventIds = {
    type = "table",
    transform = function(val)
      -- Convert string to array if needed
      if type(val) == "string" then
        return json.parse(val)
      -- Convert single number to array
      elseif type(val) == "number" then
        return {val}
      -- Use as is if already array
      elseif type(val) == "table" then
        return val
      end
      return {}
    end,
    validate = function(val)
      if not val then return true end -- Optional field

      if type(val) ~= "table" then
        return false, "eventIds must be an array"
      end

      -- Check if all events exist
      for _, eventId in ipairs(val) do
        local results = DbClient:select("SELECT 1 FROM events WHERE id = ?", {eventId})
        if not results or #results == 0 then
          return false, "Event with ID " .. eventId .. " doesn't exist"
        end
      end

      return true
    end
  }
}

local packManager = dataHelper.createCrudManager({
  name = "Pack",
  schema = packSchema,
  tableName = "packs",
  authClient = authClient,
  requiredCreateFields = {"pack_name", "description"},
  uniqueFields = {"pack_name"},
  sortBy = "-id", -- Sort by id in descending order (newest first)
  listResponseKey = "packs",

  beforeList = function(results, msg)
    for _, pack in ipairs(results) do
      -- Fetch categories for this pack
      local categoryResults = DbClient:select(
        "SELECT category_id FROM pack_categories WHERE pack_id = ?", 
        {pack.id}
      )

      -- Convert to array of category IDs
      local category_ids = {}
      for _, cat in ipairs(categoryResults or {}) do
        table.insert(category_ids, cat.category_id)
      end
      pack.category_ids = category_ids

      -- Fetch events for this pack
      local eventResults = DbClient:select(
        "SELECT event_id FROM pack_events WHERE pack_id = ?",
        {pack.id}
      )

      -- Convert to array of event IDs
      local eventIds = {}
      for _, evt in ipairs(eventResults or {}) do
        table.insert(eventIds, evt.event_id)
      end
      pack.eventIds = eventIds
    end
    return results
  end,

  afterCreate = function(id, item)
    -- Handle categories
    if item.category_ids and type(item.category_ids) == "table" then
      for _, catId in ipairs(item.category_ids) do
        DbClient:apply(
          "INSERT INTO pack_categories (pack_id, category_id) VALUES (?, ?)",
          {id, catId}
        )
      end
    end

    -- Handle events
    if item.eventIds and type(item.eventIds) == "table" then
      for _, eventId in ipairs(item.eventIds) do
        DbClient:apply(
          "INSERT INTO pack_events (pack_id, event_id) VALUES (?, ?)",
          {id, eventId}
        )
      end
    end

    return true
  end,

  afterEdit = function(id, item, originalMsg)
    -- Handle category relationship changes
    if item.category_ids then
      -- Remove existing categories
      DbClient:apply("DELETE FROM pack_categories WHERE pack_id = ?", {id})

      -- Add new categories
      if type(item.category_ids) == "table" then
        for _, catId in ipairs(item.category_ids) do
          DbClient:apply(
            "INSERT INTO pack_categories (pack_id, category_id) VALUES (?, ?)",
            {id, catId}
          )
        end
      end
    end

    -- Handle event relationship changes
    if item.eventIds then
      -- Remove existing events
      DbClient:apply("DELETE FROM pack_events WHERE pack_id = ?", {id})

      -- Add new events
      if type(item.eventIds) == "table" then
        for _, eventId in ipairs(item.eventIds) do
          DbClient:apply(
            "INSERT INTO pack_events (pack_id, event_id) VALUES (?, ?)",
            {id, eventId}
          )
        end
      end
    end

    return true
  end
})

return {
  initSQL = initSQL,
  initSampleData = initSampleData,
  packSchema = packSchema,

  -- Standard CRUD handlers
  listPacksHandler = function(msg) packManager:list(msg) end,
  createPack = function(msg) packManager:create(msg) end,
  editPack = function(msg) packManager:edit(msg) end,
  deletePack = function(msg) packManager:delete(msg) end,
  adminActionHandler = function(msg) packManager:adminActionHandler(msg) end,
  handleAuthCheckReply = function(msg) packManager:handleAuthCheckReply(msg) end,
}
