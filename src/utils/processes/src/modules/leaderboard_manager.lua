local msgHelper = require("lib.msg_helper")
local dataHelper = require("lib.data_helper")
local json = require("json")

local initSQL = [[
CREATE TABLE IF NOT EXISTS leaderboard_stats (
    id INTEGER PRIMARY KEY,
    player_address TEXT UNIQUE NOT NULL,
    total_rank_points INTEGER NOT NULL DEFAULT 0,
    cards_owned INTEGER NOT NULL DEFAULT 0,
    packs_opened INTEGER NOT NULL DEFAULT 0,
    total_spent INTEGER NOT NULL DEFAULT 0,
    wins INTEGER NOT NULL DEFAULT 0,
    losses INTEGER NOT NULL DEFAULT 0,
    last_activity_date INTEGER,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_total_rank_points ON leaderboard_stats (total_rank_points DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_player_address ON leaderboard_stats (player_address);
CREATE INDEX IF NOT EXISTS idx_leaderboard_last_activity ON leaderboard_stats (last_activity_date DESC);
]]

local initSampleData = [[
INSERT INTO leaderboard_stats (id, player_address, total_rank_points, cards_owned, packs_opened, total_spent, wins, losses, last_activity_date)
  VALUES (1, '3lOWXrKJ-58YfD76zLhfVdlM6RpJ2ZuuEgG8Q5OJWI8', 1500, 45, 12, 2400, 28, 7, 1672531200);
INSERT INTO leaderboard_stats (id, player_address, total_rank_points, cards_owned, packs_opened, total_spent, wins, losses, last_activity_date)
  VALUES (2, 'ABC123def456ghi789jkl012mno345pqr678stu901vwx', 1200, 32, 8, 1800, 22, 12, 1672444800);
INSERT INTO leaderboard_stats (id, player_address, total_rank_points, cards_owned, packs_opened, total_spent, wins, losses, last_activity_date)
  VALUES (3, 'XYZ789abc012def345ghi678jkl901mno234pqr567stu', 950, 28, 6, 1200, 18, 15, 1672358400);
INSERT INTO leaderboard_stats (id, player_address, total_rank_points, cards_owned, packs_opened, total_spent, wins, losses, last_activity_date)
  VALUES (4, 'DEF456ghi789jkl012mno345pqr678stu901vwx234yzab', 800, 20, 4, 800, 12, 8, 1672272000);
INSERT INTO leaderboard_stats (id, player_address, total_rank_points, cards_owned, packs_opened, total_spent, wins, losses, last_activity_date)
  VALUES (5, 'GHI012jkl345mno678pqr901stu234vwx567yzab890cde', 650, 15, 3, 600, 10, 10, 1672185600);
]]

local leaderboardSchema = {
  id = {
    type = "number",
    transform = tonumber,
    validate = dataHelper.validateId
  },
  player_address = { 
    type = "string",
    validate = function(val)
      if not val or val == "" then
        return false, "player_address cannot be empty"
      end
      if string.len(val) < 10 then
        return false, "player_address must be at least 10 characters"
      end
      return true
    end
  },
  total_rank_points = {
    type = "number",
    transform = tonumber,
    validate = function(val) 
      return val ~= nil and val >= 0, "total_rank_points must be a non-negative number"
    end,
    getDefault = function() return 0 end
  },
  cards_owned = {
    type = "number",
    transform = tonumber,
    validate = function(val) 
      return val ~= nil and val >= 0, "cards_owned must be a non-negative number"
    end,
    getDefault = function() return 0 end
  },
  packs_opened = {
    type = "number",
    transform = tonumber,
    validate = function(val) 
      return val ~= nil and val >= 0, "packs_opened must be a non-negative number"
    end,
    getDefault = function() return 0 end
  },
  total_spent = {
    type = "number",
    transform = tonumber,
    validate = function(val) 
      return val ~= nil and val >= 0, "total_spent must be a non-negative number"
    end,
    getDefault = function() return 0 end
  },
  wins = {
    type = "number",
    transform = tonumber,
    validate = function(val) 
      return val ~= nil and val >= 0, "wins must be a non-negative number"
    end,
    getDefault = function() return 0 end
  },
  losses = {
    type = "number",
    transform = tonumber,
    validate = function(val) 
      return val ~= nil and val >= 0, "losses must be a non-negative number"
    end,
    getDefault = function() return 0 end
  },
  last_activity_date = {
    type = "number",
    transform = tonumber,
    validate = function(val) 
      if val == nil then return true end -- Optional field
      return val > 0, "last_activity_date must be a positive timestamp"
    end
  }
}

-- Custom function to build WHERE clause with advanced operators
local function buildAdvancedWhereClause(filters, schema)
  local conditions = {}
  local values = {}

  for filterKey, value in pairs(filters or {}) do
    -- Parse operators like "total_rank_points[gte]"
    local field, operator = filterKey:match("^([%w_]+)%[([%w_]+)%]$")
    
    if field and operator then
      -- Field with operator
      if schema[field] then
        if operator == "gte" then
          table.insert(conditions, field .. " >= ?")
          table.insert(values, value)
        elseif operator == "lte" then
          table.insert(conditions, field .. " <= ?")
          table.insert(values, value)
        elseif operator == "gt" then
          table.insert(conditions, field .. " > ?")
          table.insert(values, value)
        elseif operator == "lt" then
          table.insert(conditions, field .. " < ?")
          table.insert(values, value)
        elseif operator == "ne" then
          table.insert(conditions, field .. " != ?")
          table.insert(values, value)
        end
      end
    else
      -- Simple field equality
      if schema[filterKey] then
        table.insert(conditions, filterKey .. " = ?")
        table.insert(values, value)
      end
    end
  end

  if #conditions > 0 then
    return " WHERE " .. table.concat(conditions, " AND "), values
  end

  return "", {}
end

-- Custom list handler for leaderboard stats
local function listLeaderboardStatsHandler(msg)
  local success, errMsg = dataHelper.jsonToTable(msg, "listLeaderboardStats")
  if not success then
    return msgHelper.errorReply(msg, errMsg)
  end

  -- Extract parameters from message data
  local page = 1
  local pageSize = 10
  local filters = {}
  local sortBy = "-total_rank_points" -- Default sort by total_rank_points descending

  if msg.Data and type(msg.Data) == "table" then
    if msg.Data.page then page = msg.Data.page end
    if msg.Data.pageSize then pageSize = msg.Data.pageSize end
    if msg.Data.filters then filters = msg.Data.filters end
    if msg.Data.sortBy then sortBy = msg.Data.sortBy end
  end

  -- Pagination
  local offset = (page - 1) * pageSize
  local limit = pageSize

  -- Build WHERE clause for filtering with advanced operators
  local whereClause, whereValues = buildAdvancedWhereClause(filters, leaderboardSchema)

  -- Build ORDER BY clause
  local orderBy = ""
  if sortBy then
    local sortField = sortBy
    local direction = "ASC"

    if type(sortField) == "string" and sortField:sub(1, 1) == "-" then
      sortField = sortField:sub(2)
      direction = "DESC"
    end

    -- Validate sort field exists in schema
    if leaderboardSchema[sortField] then
      orderBy = " ORDER BY " .. sortField .. " " .. direction
    else
      orderBy = " ORDER BY total_rank_points DESC" -- Default fallback
    end
  end

  local query = "SELECT * FROM leaderboard_stats" ..
                whereClause ..
                orderBy ..
                " LIMIT " .. limit .. " OFFSET " .. offset

  local results
  if #whereValues > 0 then
    results = DbClient:select(query, whereValues)
  else
    results = DbClient:exec(query)
  end

  local response = {
    leaderboard_stats = results or {}
  }

  msgHelper.successReply(msg, response)
end

return {
  initSQL = initSQL,
  initSampleData = initSampleData,
  leaderboardSchema = leaderboardSchema,
  listLeaderboardStatsHandler = listLeaderboardStatsHandler,
}

