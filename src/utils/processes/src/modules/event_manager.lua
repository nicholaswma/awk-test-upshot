local authClient = require("lib.auth_client")
local dataHelper = require("lib.data_helper")
local json = require("json")

local VALID_STATUSES = {"active", "pending resolution", "resolved", "draft"}

local initSQL = [[
CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY,
    event_name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    rules TEXT NOT NULL,
    image TEXT,
    status TEXT NOT NULL DEFAULT 'draft',
    event_date INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_event_status ON events (status);
CREATE INDEX IF NOT EXISTS idx_event_date ON events (event_date);

CREATE TABLE IF NOT EXISTS category_events (
    category_id INTEGER NOT NULL,
    event_id INTEGER NOT NULL,
    PRIMARY KEY (category_id, event_id),
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE outcomes (
    id INTEGER PRIMARY KEY,
    event_id INTEGER NOT NULL,
    outcome_name TEXT NOT NULL,
    is_winner INTEGER DEFAULT 0,
    UNIQUE (event_id, outcome_name),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_outcomes_event_id ON outcomes(event_id);
]]

local initSampleData = [[
INSERT INTO events (id, event_name, description, rules, image, status, event_date)
  VALUES (1, 'F1 Singapore Grand Prix Winner', 'description', 'rules', 'arweave-tx-hash', 'active', 1759680000);
INSERT INTO events (id, event_name, description, rules, image, status, event_date)
  VALUES (2, 'Highest grossing movie in 2025', 'description', 'rules', 'arweave-tx-hash', 'active', 1767225600);
INSERT INTO events (id, event_name, description, rules, image, status, event_date)
  VALUES (3, '2024 US Presidential Election Winner', 'description', 'rules', 'arweave-tx-hash', 'resolved', 1730851200);
INSERT INTO category_events (category_id, event_id) VALUES (1, 1);
INSERT INTO category_events (category_id, event_id) VALUES (2, 2);
INSERT INTO category_events (category_id, event_id) VALUES (3, 3);
INSERT INTO outcomes (event_id, outcome_name, is_winner) VALUES (1, 'Lando Norris', 0);
INSERT INTO outcomes (event_id, outcome_name, is_winner) VALUES (1, 'Oscar Piastri', 0);
INSERT INTO outcomes (event_id, outcome_name, is_winner) VALUES (1, 'Max Verstappen', 0);
INSERT INTO outcomes (event_id, outcome_name, is_winner) VALUES (1, 'Lewis Hamilton', 0);
INSERT INTO outcomes (event_id, outcome_name, is_winner) VALUES (1, 'Charles Leclerc', 0);
INSERT INTO outcomes (event_id, outcome_name, is_winner) VALUES (1, 'Other Driver', 0);
INSERT INTO outcomes (event_id, outcome_name, is_winner) VALUES (2, 'Minecraft Movie', 0);
INSERT INTO outcomes (event_id, outcome_name, is_winner) VALUES (2, 'Zootopia 2', 0);
INSERT INTO outcomes (event_id, outcome_name, is_winner) VALUES (2, 'Lilo & Stitch', 0);
INSERT INTO outcomes (event_id, outcome_name, is_winner) VALUES (2, 'Avatar 3', 0);
INSERT INTO outcomes (event_id, outcome_name, is_winner) VALUES (2, 'Superman', 0);
INSERT INTO outcomes (event_id, outcome_name, is_winner) VALUES (2, 'Other Movie', 0);
INSERT INTO outcomes (event_id, outcome_name, is_winner) VALUES (3, 'Donald Trump', 1);
INSERT INTO outcomes (event_id, outcome_name, is_winner) VALUES (3, 'Kamala Harris', 0);
]]

local eventSchema = {
  id = {
    type = "number",
    transform = tonumber,
    validate = dataHelper.validateId
  },
  event_name = {
    type = "string", 
    validate = function(val) return dataHelper.validateNotEmpty(val, "event_name") end
  },
  description = { 
    type = "string",
    validate = function(val) return dataHelper.validateNotEmpty(val, "description") end
  },
  rules = { type = "string" },
  image = { type = "string" },
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
      return "active"
    end
  },
  event_date = {
    type = "number",
    transform = tonumber,
    validate = function(val)
      if not val then
        return false, "event_date must be a timestamp number"
      end
      return true
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
  outcomes = {
    type = "table",
    validate = function(val)
      if not val then return true end -- Optional field

      if type(val) ~= "table" then
        return false, "outcomes must be an array"
      end
      return true
    end
  },
  winning_outcome = { type = "string" },
}

local eventManager = dataHelper.createCrudManager({
  name = "Event",
  schema = eventSchema,
  tableName = "events",
  authClient = authClient,
  requiredCreateFields = {"event_name", "description", "event_date"},
  uniqueFields = {"event_name"},
  sortBy = "-id", -- Sort by id in descending order (newest first)
  listResponseKey = "events",

  beforeList = function(results, msg)
    for _, event in ipairs(results) do
      -- Fetch outcomes for this event
      local outcomeResults = DbClient:select(
        "SELECT outcome_name, is_winner FROM outcomes WHERE event_id = ?",
        {event.id}
      )

      -- Convert to array of outcome names and find winner
      local outcomes = {}
      local winning_outcome = nil
      for _, outcome in ipairs(outcomeResults or {}) do
        table.insert(outcomes, outcome.outcome_name)
        if outcome.is_winner == 1 then
          winning_outcome = outcome.outcome_name
        end
      end

      event.outcomes = outcomes
      event.winning_outcome = winning_outcome
    end
    return results
  end,

  afterCreate = function(id, item)
    -- Handle categories
    local categoryIds = {}

    if item.category_ids and type(item.category_ids) == "table" then
      categoryIds = item.category_ids
    end

    -- Insert all categories
    for _, catId in ipairs(categoryIds) do
      DbClient:apply(
        "INSERT INTO category_events (category_id, event_id) VALUES (?, ?)",
        {catId, id}
      )
    end

    -- Handle outcomes if provided
    if item.outcomes and type(item.outcomes) == "table" then
      for _, outcomeName in ipairs(item.outcomes) do
        -- Set as winner if it matches the winning_outcome
        local isWinner = 0
        if item.winning_outcome and item.winning_outcome == outcomeName then
          isWinner = 1
        end

        DbClient:apply(
          "INSERT INTO outcomes (event_id, outcome_name, is_winner) VALUES (?, ?, ?)",
          {id, outcomeName, isWinner}
        )
      end
    end

    return true
  end,

  afterEdit = function(id, item, originalMsg)
    -- Handle category relationship changes
    if item.category_ids then
      -- Determine the category IDs to set
      local categoryIds = {}

      if item.category_ids and type(item.category_ids) == "table" then
        categoryIds = item.category_ids
      end

      -- Remove existing categories and add new ones
      if #categoryIds > 0 then
        -- Remove existing category relationships
        DbClient:apply("DELETE FROM category_events WHERE event_id = ?", {id})

        -- Add new category relationships
        for _, catId in ipairs(categoryIds) do
          DbClient:apply(
            "INSERT INTO category_events (category_id, event_id) VALUES (?, ?)",
            {catId, id}
          )
        end
      end
    end

    -- Handle outcomes updates
    if item.outcomes and type(item.outcomes) == "table" then
      -- Get current outcomes
      local currentOutcomes = DbClient:select(
        "SELECT outcome_name FROM outcomes WHERE event_id = ?",
        {id}
      )

      -- Track existing outcomes to avoid duplicates
      local existingOutcomes = {}
      for _, outcome in ipairs(currentOutcomes or {}) do
        existingOutcomes[outcome.outcome_name] = true
      end

      -- Add new outcomes
      for _, outcomeName in ipairs(item.outcomes) do
        if not existingOutcomes[outcomeName] then
          -- Set as winner if it matches the winning_outcome
          local isWinner = 0
          if item.winning_outcome and item.winning_outcome == outcomeName then
            isWinner = 1
          end

          DbClient:apply(
            "INSERT INTO outcomes (event_id, outcome_name, is_winner) VALUES (?, ?, ?)",
            {id, outcomeName, isWinner}
          )
        end
      end

      -- Remove outcomes that aren't in the new list
      local placeholders = {}
      local values = {id}

      for _, outcomeName in ipairs(item.outcomes) do
        table.insert(placeholders, "?")
        table.insert(values, outcomeName)
      end

      if #placeholders > 0 then
        local whereClause = table.concat(placeholders, ", ")
        DbClient:apply(
          "DELETE FROM outcomes WHERE event_id = ? AND outcome_name NOT IN (" .. whereClause .. ")",
          values
        )
      else
        -- If no outcomes provided, delete all outcomes
        DbClient:apply("DELETE FROM outcomes WHERE event_id = ?", {id})
      end
    end

    -- Handle winning outcome
    if item.winning_outcome then
      local outcomeExists = DbClient:select(
        "SELECT 1 FROM outcomes WHERE event_id = ? AND outcome_name = ?",
        {id, item.winning_outcome}
      )
      if not outcomeExists or #outcomeExists == 0 then
        return false, "Winning outcome '" .. item.winning_outcome .. "' does not exist for this event"
      end

      -- Reset all winners
      DbClient:apply(
        "UPDATE outcomes SET is_winner = 0 WHERE event_id = ?",
        {id}
      )

      -- Set the new winner
      DbClient:apply(
        "UPDATE outcomes SET is_winner = 1 WHERE event_id = ? AND outcome_name = ?",
        {id, item.winning_outcome}
      )
    end

    return true
  end,
})

-- Export the module
return {
  initSQL = initSQL,
  initSampleData = initSampleData,
  eventSchema = eventSchema,

  -- Standard CRUD handlers
  listEventsHandler = function(msg) eventManager:list(msg) end,
  createEvent = function(msg) eventManager:create(msg) end,
  editEvent = function(msg) eventManager:edit(msg) end,
  deleteEvent = function(msg) eventManager:delete(msg) end,
  adminActionHandler = function(msg) eventManager:adminActionHandler(msg) end,
  handleAuthCheckReply = function(msg) eventManager:handleAuthCheckReply(msg) end,
}