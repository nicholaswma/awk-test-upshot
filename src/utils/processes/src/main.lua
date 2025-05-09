local msgHelper = require("lib.msg_helper")
local categoryManager = require("modules.category_manager")
local packManager = require("modules.pack_manager")
local eventManager = require("modules.event_manager")
local cardManager = require("modules.card_manager")
local sqlite3 = require("lsqlite3")
local dbAdmin = require("lib.DbAdmin")

PendingAdminActions = PendingAdminActions or {}

local moduleMap = {
  ["CategoryManager"] = categoryManager.handleAuthCheckReply,
  ["PackManager"] = packManager.handleAuthCheckReply,
  ["EventManager"] = eventManager.handleAuthCheckReply,
  ["CardManager"] = cardManager.handleAuthCheckReply,
}

-------------------------------------------------------------------------------
-- Handler helper functions
-------------------------------------------------------------------------------
local function initDb(msg)
  if not DB then
    DB = sqlite3.open_memory()
  end

  if not DbClient then
    DbClient = dbAdmin.new(DB)
  end

  local tables = {
    -- Table name, schema SQL, sample data insert statements
    {"categories", categoryManager.initSQL, categoryManager.initSampleData},
    {"packs", packManager.initSQL, packManager.initSampleData},
    {"events", eventManager.initSQL, eventManager.initSampleData},
    {"cards", cardManager.initSQL, cardManager.initSampleData},
  }

  for _, item in ipairs(tables) do
    local tableName, schemaSQL, sampleData = item[1], item[2], item[3]

    if schemaSQL then
      DbClient:execMulti(schemaSQL)
    end

    if DbClient:count(tableName) == 0 then
      DbClient:execMulti(sampleData)
    end
  end

  msgHelper.successReply(msg)

  return DbClient
end

local function authCheckReplyHandler(msg)
  local data = msgHelper.requireFieldsOrError(
    msg,
    msg.Data,
    {"moduleName"},
    "Auth check reply error"
  )
  if not data then return nil, nil end

  local handler = moduleMap[data.moduleName]
  if not moduleMap[data.moduleName] then
    msgHelper.errorReply(msg, "Invalid reply: Unknown moduleName")
    return nil, nil
  end

  -- Execute the handler function for the module
  return handler(msg)
end

-------------------------------------------------------------------------------
--- Common Handlers
-------------------------------------------------------------------------------
Handlers.once( -- This handler can run only once per deployment (can run again after a redeploy)
  "InitDbHandler",
  Handlers.utils.hasMatchingTag("Action", "InitDb"),
  initDb
)

Handlers.add(
  "AuthCheckReplyHandler",
  Handlers.utils.hasMatchingTag("From-Process", "AUTH_MANAGER_PROCESS_ID"), -- Value set by deploy.yml
  authCheckReplyHandler
)

-------------------------------------------------------------------------------
-- Category Handlers
-------------------------------------------------------------------------------
Handlers.add(
  "ListCategoriesHandler",
  Handlers.utils.hasMatchingTag("Action", "ListCategories"),
  categoryManager.listCategoriesHandler
)

Handlers.add(
  "CategoryAdminActionHandler",
  function(msg)
    local action = msg.Tags["Action"]
    return action == "CreateCategory" or action == "EditCategory" or action == "DeleteCategory"
  end,
  categoryManager.adminActionHandler
)

-------------------------------------------------------------------------------
-- Pack Handlers
-------------------------------------------------------------------------------
Handlers.add(
  "ListPacksHandler",
  Handlers.utils.hasMatchingTag("Action", "ListPacks"),
  packManager.listPacksHandler
)

Handlers.add(
  "PackAdminActionHandler",
  function(msg)
    local action = msg.Tags["Action"]
    return action == "CreatePack" or action == "EditPack" or action == "DeletePack"
  end,
  packManager.adminActionHandler
)

-------------------------------------------------------------------------------
-- Event Handlers
-------------------------------------------------------------------------------
Handlers.add(
  "ListEventsHandler",
  Handlers.utils.hasMatchingTag("Action", "ListEvents"),
  eventManager.listEventsHandler
)

Handlers.add(
  "EventAdminActionHandler",
  function(msg)
    local action = msg.Tags["Action"]
    return action == "CreateEvent" or action == "EditEvent" or action == "DeleteEvent"
  end,
  eventManager.adminActionHandler
)

-------------------------------------------------------------------------------
-- Card Handlers
-------------------------------------------------------------------------------
Handlers.add(
  "ListCardsHandler",
  Handlers.utils.hasMatchingTag("Action", "ListCards"),
  cardManager.listCardsHandler
)

Handlers.add(
  "GetCardsByEventHandler",
  Handlers.utils.hasMatchingTag("Action", "GetCardsByEvent"),
  cardManager.getCardsByEventHandler
)

Handlers.add(
  "CardAdminActionHandler",
  function(msg)
    local action = msg.Tags["Action"]
    return action == "CreateCard" or action == "EditCard" or action == "DeleteCard"
  end,
  cardManager.adminActionHandler
)
