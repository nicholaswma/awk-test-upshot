local authClient = require("lib.auth_client")
local msgHelper = require("lib.msg_helper")
local dataHelper = require("lib.data_helper")
local json = require("json")

local VALID_RARITIES = {"common", "uncommon", "rare", "legendary"}

local initSQL = [[
CREATE TABLE IF NOT EXISTS cards (
    id INTEGER PRIMARY KEY,
    card_name TEXT NOT NULL,
    rarity TEXT NOT NULL DEFAULT 'common',
    outcome_id INTEGER NOT NULL,
    image TEXT,
    description TEXT NOT NULL,
    remaining_supply INTEGER NOT NULL,
    max_supply INTEGER NOT NULL,
    never_reduce_supply INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (outcome_id) REFERENCES outcomes(id) ON DELETE RESTRICT,
    UNIQUE (outcome_id, card_name)
);

CREATE INDEX IF NOT EXISTS idx_cards_outcome_id ON cards (outcome_id);
]]

local initSampleData = [[
-- F1 Singapore Grand Prix cards (outcome IDs 1-6)
INSERT INTO cards (id, card_name, outcome_id, image, description, rarity, remaining_supply, max_supply, never_reduce_supply) 
  VALUES (1, 'Lando Norris', 1, 'arweave-tx-hash', 'description', 'common', 100, 100, 0);
INSERT INTO cards (id, card_name, outcome_id, image, description, rarity, remaining_supply, max_supply, never_reduce_supply) 
  VALUES (2, 'Oscar Piastri', 2, 'arweave-tx-hash', 'description', 'common', 100, 100, 0);
INSERT INTO cards (id, card_name, outcome_id, image, description, rarity, remaining_supply, max_supply, never_reduce_supply) 
  VALUES (3, 'Max Verstappen', 3, 'arweave-tx-hash', 'description', 'common', 100, 100, 0);
INSERT INTO cards (id, card_name, outcome_id, image, description, rarity, remaining_supply, max_supply, never_reduce_supply) 
  VALUES (4, 'Lewis Hamilton', 4, 'arweave-tx-hash', 'description', 'common', 100, 100, 0);
INSERT INTO cards (id, card_name, outcome_id, image, description, rarity, remaining_supply, max_supply, never_reduce_supply) 
  VALUES (5, 'Charles Leclerc', 5, 'arweave-tx-hash', 'description', 'common', 100, 100, 0);
INSERT INTO cards (id, card_name, outcome_id, image, description, rarity, remaining_supply, max_supply, never_reduce_supply) 
  VALUES (6, 'Other Driver', 6, 'arweave-tx-hash', 'description', 'common', 100, 100, 0);

-- Movie cards (outcome IDs 7-12)
INSERT INTO cards (id, card_name, outcome_id, image, description, rarity, remaining_supply, max_supply, never_reduce_supply) 
  VALUES (7, 'Minecraft Movie', 7, 'arweave-tx-hash', 'description', 'common', 100, 100, 0);
INSERT INTO cards (id, card_name, outcome_id, image, description, rarity, remaining_supply, max_supply, never_reduce_supply) 
  VALUES (8, 'Zootopia 2', 8, 'arweave-tx-hash', 'description', 'common', 100, 100, 0);
INSERT INTO cards (id, card_name, outcome_id, image, description, rarity, remaining_supply, max_supply, never_reduce_supply) 
  VALUES (9, 'Lilo & Stitch', 9, 'arweave-tx-hash', 'description', 'common', 100, 100, 0);
INSERT INTO cards (id, card_name, outcome_id, image, description, rarity, remaining_supply, max_supply, never_reduce_supply) 
  VALUES (10, 'Avatar 3', 10, 'arweave-tx-hash', 'description', 'common', 100, 100, 0);
INSERT INTO cards (id, card_name, outcome_id, image, description, rarity, remaining_supply, max_supply, never_reduce_supply) 
  VALUES (11, 'Superman', 11, 'arweave-tx-hash', 'description', 'common', 100, 100, 0);
INSERT INTO cards (id, card_name, outcome_id, image, description, rarity, remaining_supply, max_supply, never_reduce_supply) 
  VALUES (12, 'Other Movie', 12, 'arweave-tx-hash', 'description', 'common', 100, 100, 0);

-- Election cards (outcome IDs 13-14)
INSERT INTO cards (id, card_name, outcome_id, image, description, rarity, remaining_supply, max_supply, never_reduce_supply) 
  VALUES (13, 'Donald Trump', 13, 'arweave-tx-hash', 'description', 'common', 100, 100, 0);
INSERT INTO cards (id, card_name, outcome_id, image, description, rarity, remaining_supply, max_supply, never_reduce_supply) 
  VALUES (14, 'Kamala Harris', 14, 'arweave-tx-hash', 'description', 'common', 100, 100, 0);
]]

local cardSchema = {
  id = {
    type = "number",
    transform = tonumber,
    validate = dataHelper.validateId
  },
  outcome_id = {
    type = "number",
    transform = tonumber,
    validate = function(val)
      if not val then
        return false, "outcome_id is required"
      end
      
      -- Verify the outcome exists
      local results = DbClient:select("SELECT 1 FROM outcomes WHERE id = ?", {val})
      if not results or #results == 0 then
        return false, "Outcome with ID " .. val .. " doesn't exist"
      end
      
      return true
    end
  },
  card_name = {
    type = "string", 
    validate = function(val) return dataHelper.validateNotEmpty(val, "card_name") end
  },
  rarity = {
    type = "string",
    validate = function(val)
      if not val then
        return false, "rarity cannot be nil"
      end

      -- Case-insensitive check
      local lowerVal = string.lower(val)
      for _, v in ipairs(VALID_RARITIES) do
        if v == lowerVal then
          return true
        end
      end

      return false, "rarity must be one of: " .. table.concat(VALID_RARITIES, ", ")
    end,
    transform = function(val)
      if val then
        return string.lower(val)
      end
      return val
    end,
    getDefault = function()
      return "common"
    end
  },
  image = { type = "string" },
  description = {
    type = "string",
    validate = function(val) return dataHelper.validateNotEmpty(val, "description") end
  },
  remaining_supply = {
    type = "number",
    transform = tonumber,
    validate = function(val)
      if not val then
        return false, "remaining_supply is required"
      end
      if val < 0 then
        return false, "remaining_supply must be 0 or greater"
      end
      return true
    end,
    getDefault = function(item)
      -- Initialize remaining_supply to match max_supply
      return item.max_supply
    end
  },
  max_supply = {
    type = "number",
    transform = tonumber,
    validate = function(val)
      if not val then
        return false, "max_supply is required"
      end
      if val < 1 then
        return false, "max_supply must be at least 1"
      end
      return true
    end,
    getDefault = function()
      return 100
    end
  },
  never_reduce_supply = {
    type = "boolean",
    transform = function(val)
      if type(val) == "boolean" then
        return val and 1 or 0
      elseif type(val) == "number" then
        return val ~= 0 and 1 or 0
      elseif type(val) == "string" then
        return (val == "true" or val == "1") and 1 or 0
      end
      return 0
    end,
    getDefault = function()
      return 0
    end
  }
}

local cardManager = dataHelper.createCrudManager({
  name = "Card",
  schema = cardSchema,
  tableName = "cards",
  authClient = authClient,
  requiredCreateFields = {"outcome_id", "card_name", "description"},
  uniqueFields = {},  -- Using a compound UNIQUE constraint in the table definition instead
  sortBy = "-id", -- Sort by id in descending order (newest first)
  listResponseKey = "cards",

  -- Custom validation for unique card name per outcome
  beforeCreate = function(self, data, msg)
    -- Get event_id for this outcome to check uniqueness
    local outcome = DbClient:select("SELECT event_id FROM outcomes WHERE id = ?", {data.outcome_id})
    if not outcome or #outcome == 0 then
      return false, "Outcome with ID " .. data.outcome_id .. " doesn't exist"
    end
    
    -- Check if card name already exists for this outcome
    local results = DbClient:select(
      "SELECT 1 FROM cards WHERE outcome_id = ? AND card_name = ?",
      {data.outcome_id, data.card_name}
    )
    
    if results and #results > 0 then
      return false, "Card name '" .. data.card_name .. "' already exists for this outcome"
    end
    
    return true
  end,
  
  -- Add event_id to each record for list output
  beforeList = function(results, msg)
    for _, card in ipairs(results) do
      -- Get event_id for this outcome
      local outcome = DbClient:select("SELECT event_id FROM outcomes WHERE id = ?", {card.outcome_id})
      if outcome and #outcome > 0 then
        card.event_id = outcome[1].event_id
      end
    end
    return results
  end,
})

cardManager.getCardsByEvent = function(self, msg)
  local success, errMsg = dataHelper.jsonToTable(msg, "getCardsByEvent")
  if not success then
    return msgHelper.errorReply(msg, errMsg)
  end

  local requestData = msgHelper.requireFieldsOrError(
    msg,
    msg.Data,
    {"event_id"},
    "getCardsByEvent",
    "reply"
  )
  if not requestData then return end

  -- Validate event_id
  local event_id = tonumber(requestData.event_id)
  if not event_id or event_id < 1 then
    return msgHelper.errorReply(msg, "getCardsByEvent: event_id must be a valid number")
  end

  -- Get all cards for the event in a single JOIN query
  local query = [[
    SELECT c.*, o.event_id 
    FROM cards c
    JOIN outcomes o ON c.outcome_id = o.id
    WHERE o.event_id = ?
    ORDER BY c.id
  ]]

  local results = DbClient:select(query, {event_id})

  -- If no results, check if the event exists
  if not results or #results == 0 then
    local eventExists = DbClient:select("SELECT 1 FROM events WHERE id = ?", {event_id})
    if not eventExists or #eventExists == 0 then
      return msgHelper.errorReply(msg, "getCardsByEvent: Event with ID " .. event_id .. " doesn't exist")
    end
  end

  -- Return the results
  msgHelper.successReply(msg, {cards = results or {}})
end

-- Export the module
return {
  initSQL = initSQL,
  initSampleData = initSampleData,
  cardSchema = cardSchema,

  -- Standard CRUD handlers
  listCardsHandler = function(msg) cardManager:list(msg) end,
  createCard = function(msg) cardManager:create(msg) end,
  editCard = function(msg) cardManager:edit(msg) end,
  deleteCard = function(msg) cardManager:delete(msg) end,
  adminActionHandler = function(msg) cardManager:adminActionHandler(msg) end,
  handleAuthCheckReply = function(msg) cardManager:handleAuthCheckReply(msg) end,

  -- Custom handlers
  getCardsByEventHandler = function(msg) cardManager:getCardsByEvent(msg) end
}