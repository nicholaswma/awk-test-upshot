local authClient = require("lib.auth_client")
local msgHelper = require("lib.msg_helper")
local dataHelper = require("lib.data_helper")

local VALID_STATUSES = {"active", "coming soon", "archived"}

local initSQL = [[
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY,
    category_name TEXT UNIQUE NOT NULL,
    status TEXT NOT NULL DEFAULT 'coming soon',
    image TEXT,
    color_gradient TEXT,
    sort_order INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_category_sort_order ON categories (sort_order);
CREATE INDEX IF NOT EXISTS idx_category_status ON categories (status);
]]

local initSampleData = [[
INSERT INTO categories (id, category_name, status, image, color_gradient, sort_order)
  VALUES (1, 'Sports', 'active', 'arweave-tx-hash', 'colorGradientCss', 1);
INSERT INTO categories (id, category_name, status, image, color_gradient, sort_order)
  VALUES (2, 'Entertainment', 'active', 'arweave-tx-hash', 'colorGradientCss', 2);
INSERT INTO categories (id, category_name, status, image, color_gradient, sort_order)
  VALUES (3, 'Politics', 'active', 'arweave-tx-hash', 'colorGradientCss', 3);
]]

local categorySchema = {
  id = {
    type = "number",
    transform = tonumber,
    validate = dataHelper.validateId
  },
  category_name = { type = "string" },
  status = {
    type = "string",
    allowed = VALID_STATUSES,
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
  image = { type = "string" },
  color_gradient = { type = "string" },
  sort_order = {
    type = "number",
    transform = tonumber,
    validate = function(val) 
      return val ~= nil, "sort_order must be a number"
    end,
    getDefault = function()
      local results = DbClient:exec("SELECT MAX(sort_order) as max_order FROM categories")
      local maxOrder = (results[1] and results[1].max_order) or 0
      return tonumber(maxOrder) + 1
    end
  }
}

local categoryManager = dataHelper.createCrudManager({
  name = "Category",
  schema = categorySchema,
  tableName = "categories",
  authClient = authClient,
  requiredCreateFields = {"category_name"},
  uniqueFields = {"category_name"},
  sortBy = "sort_order",
  listResponseKey = "categories",

  afterCreate = function(id, item)
    -- Any post-creation actions can go here
  end,

  afterEdit = function(id, item)
    -- Any post-edit actions can go here
  end
})

return {
  initSQL = initSQL,
  initSampleData = initSampleData,
  categorySchema = categorySchema,
  listCategoriesHandler = function(msg) categoryManager:list(msg) end,
  createCategory = function(msg) categoryManager:create(msg) end,
  editCategory = function(msg) categoryManager:edit(msg) end,
  deleteCategory = function(msg) categoryManager:delete(msg) end,
  adminActionHandler = function(msg) categoryManager:adminActionHandler(msg) end,
  handleAuthCheckReply = function(msg) categoryManager:handleAuthCheckReply(msg) end,
}
