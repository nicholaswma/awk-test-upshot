local json = require("json")
local authClient = require("lib.authClient")
local msgHelper = require("lib.msgHelper")
authClient.configure("AUTH_MANAGER_PROCESS_ID") -- Set via Github Actions variable
PendingAdminActions = PendingAdminActions or {}

Categories = Categories or {
  { categoryId = 1, categoryName = "Sports", status = "active", order = 1 },
  { categoryId = 2, categoryName = "Politics", status = "active", order = 2  },
  { categoryId = 3, categoryName = "Entertainment", status = "active", order = 3  },
}

local function findCategoryById(categoryId)
  categoryId = tonumber(categoryId)
  for i, category in ipairs(Categories) do
    if category.categoryId == categoryId then
      return category, i
    end
  end
  return nil, nil
end

local function ListCategoriesHandler(msg)
  msgHelper.successReply(msg, { categories = Categories })
end

local function createCategory(originalMsg)
  local newCategory = originalMsg.Data

  -- Validate the new category data
  if type(newCategory) ~= "table" or not newCategory.categoryName then
    msgHelper.sendErrorToOrigin(originalMsg, "Invalid category data")
    return
  end

  -- Check for duplicate category name
  for _, category in ipairs(Categories) do
    if category.categoryName == newCategory.categoryName then
      msgHelper.sendErrorToOrigin(originalMsg, "Category name already exists")
      return
    end
  end

  -- Assign new categoryId and order
  local maxId, maxOrder = 0, 0
  for _, category in ipairs(Categories) do
    if category.categoryId and category.categoryId > maxId then
      maxId = category.categoryId
    end
    if category.order and category.order > maxOrder then
      maxOrder = category.order
    end
  end
  newCategory.categoryId = maxId + 1
  newCategory.order = maxOrder + 1
  newCategory.status = newCategory.status or "active"
  
  table.insert(Categories, newCategory)
  msgHelper.sendSuccessToOrigin(originalMsg)
end

local function editCategory(originalMsg)
  local editData = originalMsg.Data
  if type(editData) ~= "table" or not editData.categoryId then
    msgHelper.sendErrorToOrigin(originalMsg, "Invalid edit data")
    return
  end
  local category = findCategoryById(editData.categoryId)
  if category then
    if editData.categoryName then category.categoryName = editData.categoryName end
    if editData.status then category.status = editData.status end
    if editData.order and tonumber(editData.order) then
      category.order = tonumber(editData.order)
    elseif editData.order then
      msgHelper.sendErrorToOrigin(originalMsg, "Order value must be a number")
      return
    end
    msgHelper.sendSuccessToOrigin(originalMsg)
  else
    msgHelper.sendErrorToOrigin(originalMsg, "Category not found")
  end
end

local function deleteCategory(originalMsg)
  local deleteData = originalMsg.Data
  if type(deleteData) ~= "table" or not deleteData.categoryId then
    msgHelper.sendErrorToOrigin(originalMsg, "Invalid delete data")
    return
  end
  local _, index = findCategoryById(deleteData.categoryId)
  if index then
    table.remove(Categories, index)
    msgHelper.sendSuccessToOrigin(originalMsg)
  else
    msgHelper.sendErrorToOrigin(originalMsg, "Category not found")
  end
end

-- Combined handler for actions requiring admin privileges
local function AdminActionHandler(msg)
  authClient.initiateAdminCheck(msg, PendingAdminActions)
end

local function HandleAuthCheckReply(msg)
    local originalMsg, isAdmin = authClient.handleAuthReply(msg, PendingAdminActions)

    if not originalMsg or not isAdmin then
      return -- Error occured. Stop processing. Error message already sent from authClient.handleAuthReply()
    end

    -- If we reach here, the user is authorized. Proceed with the original action.
    local action = originalMsg.Action
    if action == "CreateCategory" then
      createCategory(originalMsg)
    elseif action == "EditCategory" then
      editCategory(originalMsg)
    elseif action == "DeleteCategory" then
      deleteCategory(originalMsg)
    else
      msgHelper.sendErrorToOrigin(originalMsg, "Unknown action: " .. action)
    end
end

Handlers.add("ListCategoriesHandler", Handlers.utils.hasMatchingTag("Action", "ListCategories"), ListCategoriesHandler)
Handlers.add("CreateCategoryHandler", Handlers.utils.hasMatchingTag("Action", "CreateCategory"), AdminActionHandler)
Handlers.add("EditCategoryHandler", Handlers.utils.hasMatchingTag("Action", "EditCategory"), AdminActionHandler)
Handlers.add("DeleteCategoryHandler", Handlers.utils.hasMatchingTag("Action", "DeleteCategory"), AdminActionHandler)
Handlers.add("HandleAdminCheckReply", Handlers.utils.hasMatchingTag("From-Process", "AUTH_MANAGER_PROCESS_ID"), HandleAuthCheckReply) -- AUTH_MANAGER_PROCESS_ID is set via Github Actions variable

-- Export for testing
return {
  categories = Categories,
  ListCategoriesHandler = ListCategoriesHandler,
  createCategory = createCategory,
  editCategory = editCategory,
  deleteCategory = deleteCategory,
  findCategoryById = findCategoryById,
  AdminActionHandler = AdminActionHandler,
  HandleAuthCheckReply = HandleAuthCheckReply,
}