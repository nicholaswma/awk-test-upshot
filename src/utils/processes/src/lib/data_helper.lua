local json = require("json")
local msgHelper = require("lib.msg_helper")
local M = {}

-------------------------------------------------------------------------------
--- Helper functions
-------------------------------------------------------------------------------
function M.validateAndTransformField(schema, field, value, errorPrefix, originalMsg)
  local fieldSchema = schema[field]

  if fieldSchema.transform then
    value = fieldSchema.transform(value)
  end

  if fieldSchema.validate then
    local isValid, errorMsg = fieldSchema.validate(value)
    if not isValid then
      msgHelper.sendErrorToOrigin(originalMsg, errorPrefix .. ": " .. errorMsg)
      return nil
    end
  end

  return value
end

--- Transform each element in an array using the provided function
-- @param arr table - The array to transform
-- @param transformFn function - The transformation function to apply to each element
-- @return table - A new array with transformed elements
function M.transformArray(arr, transformFn)
  -- If not a table, return as is
  if not arr or type(arr) ~= "table" then
    return arr
  end

  -- Default to tonumber if no transform function provided
  transformFn = transformFn or tonumber

  -- Create a new array with transformed values
  local result = {}
  for i, value in ipairs(arr) do
    result[i] = transformFn(value) or value
  end

  return result
end

function M.jsonToTable(data, errorPrefix)
  if data and type(data) == "string" then
    local success, parsed = pcall(function() return json.parse(data) end)
    if success then
      data = parsed
      return true
    else
      return false, errorPrefix .. ": invalid JSON format"
    end
  end
  return true
end

function M.validateId(val)
  -- Allow nil for new records
  if val == nil then
    return true
  end

  -- Otherwise, enforce positive number
  if type(val) ~= "number" and not tonumber(val) then
    return false, "id must be a number"
  end

  local numVal = tonumber(val)
  if numVal < 1 then
    return false, "id must be 1 or greater"
  end

  return true
end

function M.validateNotEmpty(val, fieldName)
  if not val or val == "" then
    return false, fieldName .. " cannot be empty"
  end
  return true
end

-------------------------------------------------------------------------------
--- SQLite-based CRUD manager factory
-------------------------------------------------------------------------------
function M.createCrudManager(config)
  local manager = {}

  -- Configuration validation
  if not config.name then
    error("CRUD manager requires a name")
  end
  if not config.schema then
    error("CRUD manager requires a schema")
  end
  if not config.tableName then
    config.tableName = string.lower(config.name) .. "s"
  end

  -- Store config
  manager.name = config.name
  manager.schema = config.schema
  manager.tableName = config.tableName
  manager.authClient = config.authClient or require("lib.auth_client")
  manager.config = config

  -- Create entity handler
  function manager:create(originalMsg)
    local success, errMsg = M.jsonToTable(originalMsg, "create" .. self.name)
    if not success then
      return msgHelper.sendErrorToOrigin(originalMsg, errMsg)
    end

    local newItem = msgHelper.requireFieldsOrError(
      originalMsg,
      originalMsg.Data,
      self.config.requiredCreateFields or {},
      "create" .. self.name,
      "origin"
    )
    if not newItem then return end

    -- Process each field according to the schema
    local fields = {}
    local placeholders = {}
    local values = {}

    for field, fieldSchema in pairs(self.schema) do
      -- Apply default if provided field is nil and schema has default
      if newItem[field] == nil and fieldSchema.getDefault then
        newItem[field] = fieldSchema.getDefault()
      end

      if newItem[field] ~= nil then
        local transformedValue = M.validateAndTransformField(
          self.schema,
          field,
          newItem[field],
          "create" .. self.name,
          originalMsg
        )
        if transformedValue == nil then return end -- Error already sent

        table.insert(fields, field)
        table.insert(placeholders, "?")
        table.insert(values, transformedValue)
      end
    end

    DbClient:exec("BEGIN TRANSACTION")

    -- Build SQL query with RETURNING clause
    local sql = string.format(
      "INSERT INTO %s (%s) VALUES (%s) RETURNING id",
      self.tableName,
      table.concat(fields, ", "),
      table.concat(placeholders, ", ")
    )

    -- Execute insert and get ID in one atomic operation
    local newId
    local insertSuccess, err = pcall(function()
      local results = DbClient:select(sql, values)  -- Use select instead of apply to get returned data
      if results and results[1] then
        newId = tonumber(results[1].id)
      end
    end)

    if not insertSuccess then
      DbClient:exec("ROLLBACK")

      if err and err:find("UNIQUE constraint failed") then
        for _, field in ipairs(self.config.uniqueFields or {}) do
          if newItem[field] then
            return msgHelper.sendErrorToOrigin(
              originalMsg, 
              "create" .. self.name .. ": " .. field .. " already exists"
            )
          end
        end
        return msgHelper.sendErrorToOrigin(
          originalMsg, 
          "create" .. self.name .. ": unique constraint violation"
        )
      end
      return msgHelper.sendErrorToOrigin(originalMsg, "create" .. self.name .. ": " .. err)
    end

    -- Custom post-create hook (now using the safely obtained ID)
    local hookSuccess = true
    local hookError = nil

    if newId and self.config.afterCreate then
    -- Get the full item
    local results = DbClient:select("SELECT * FROM " .. self.tableName .. " WHERE id = ?", {newId})
    if results and results[1] then
      hookSuccess, hookError = pcall(function()
        return self.config.afterCreate(newId, results[1], originalMsg)
      end)
    end

      -- Commit or rollback based on hook success
      if hookSuccess == true then
        DbClient:exec("COMMIT")
        msgHelper.sendSuccessToOrigin(originalMsg)
      else
        DbClient:exec("ROLLBACK")

        -- If the hook explicitly returned false, we might have an error message
        if type(hookSuccess) == "boolean" and hookSuccess == false and hookError then
          return msgHelper.sendErrorToOrigin(originalMsg, "create" .. self.name .. ": " .. hookError)
        else
          return msgHelper.sendErrorToOrigin(
            originalMsg, 
            "create" .. self.name .. ": error in afterCreate hook"
          )
        end
      end
    end
  end

  -- WHERE clause builder used by List handler
  function manager:buildWhereClause(filters)
    local conditions = {}
    local values = {}

    for field, value in pairs(filters or {}) do
      -- Check if the field exists in schema
      if self.schema[field] then
        table.insert(conditions, field .. " = ?")
        table.insert(values, value)
      end
    end

    if #conditions > 0 then
      return " WHERE " .. table.concat(conditions, " AND "), values
    end

    return "", {}
  end

  -- List entities handler
  function manager:list(msg, page, pageSize, filters, sortBy)
    local success, errMsg = M.jsonToTable(msg, "list" .. self.name)
    if not success then
      return msgHelper.errorReply(msg, errMsg)
    end

    -- Extract filters, page, and pageSize from message if not provided as parameter
    if not filters and msg.Data and type(msg.Data) == "table" then
      if msg.Data.page then page = msg.Data.page end
      if msg.Data.pageSize then pageSize = msg.Data.pageSize end
      if msg.Data.filters then filters = msg.Data.filters end
      if msg.Data.sortBy then sortBy = msg.Data.sortBy end
    end

    -- Pagination
    local offset = ((page or 1) - 1) * (pageSize or 10)
    local limit = pageSize or 10

    -- Build WHERE clause for filtering
    local whereClause, whereValues = self:buildWhereClause(filters)

    -- Build ORDER BY clause
    local orderBy = ""
    if sortBy then
      local sortField = sortBy
      local direction = "ASC"

      if type(sortField) == "string" and sortField:sub(1, 1) == "-" then
        sortField = sortField:sub(2)
        direction = "DESC"
      end

      orderBy = " ORDER BY " .. sortField .. " " .. direction
    end

    local query = "SELECT * FROM " .. self.tableName ..
                  whereClause ..
                  orderBy ..
                  " LIMIT " .. limit .. " OFFSET " .. offset

    local results
    if #whereValues > 0 then
      results = DbClient:select(query, whereValues)
    else
      results = DbClient:exec(query)
    end

    -- Apply custom beforeList hook if specified
    if self.config.beforeList then
      results = self.config.beforeList(results, msg)
    end

    local responseKey = self.config.listResponseKey or (string.lower(self.name) .. "s")
    local response = {}
    response[responseKey] = results

    msgHelper.successReply(msg, response)
  end

  -- Edit entity handler
  function manager:edit(originalMsg)
    local success, errMsg = M.jsonToTable(originalMsg, "edit" .. self.name)
    if not success then
      return msgHelper.sendErrorToOrigin(originalMsg, errMsg)
    end

    local editData = msgHelper.requireFieldsOrError(
      originalMsg,
      originalMsg.Data,
      {"id"},
      "edit" .. self.name,
      "origin"
    )
    if not editData then return end

    -- Validate ID
    local validId = M.validateAndTransformField(
      self.schema,
      "id",
      editData.id,
      "edit" .. self.name,
      originalMsg
    )
    if not validId then return end -- Error already sent

    -- Build update query
    local setStatements = {}
    local values = {}

    for field, fieldSchema in pairs(self.schema) do
      if editData[field] ~= nil and field ~= "id" then  -- Skip id field
        local transformedValue = M.validateAndTransformField(
          self.schema,
          field,
          editData[field],
          "edit" .. self.name,
          originalMsg
        )
        if transformedValue == nil then return end -- Error already sent

        table.insert(setStatements, field .. " = ?")
        table.insert(values, transformedValue)
      end
    end

    if #setStatements == 0 then
      return msgHelper.sendErrorToOrigin(
        originalMsg, 
        "edit" .. self.name .. ": No fields to update"
      )
    end

    -- Add ID to values for WHERE clause
    table.insert(values, validId)

    DbClient:exec("BEGIN TRANSACTION")

    local sql = string.format(
      "UPDATE %s SET %s WHERE id = ?",
      self.tableName,
      table.concat(setStatements, ", ")
    )

    -- Execute update
    local update_success, result = pcall(function()
      return DbClient:apply(sql, values)
    end)

    if not update_success then
      -- Rollback transaction on error
      DbClient:exec("ROLLBACK")

      local err = result  -- When pcall fails, result contains the error
      if err and err:find("UNIQUE constraint failed") then
        for _, field in ipairs(self.config.uniqueFields or {}) do
          if editData[field] then
            return msgHelper.sendErrorToOrigin(
              originalMsg, 
              "edit" .. self.name .. ": " .. field .. " already exists"
            )
          end
        end
        return msgHelper.sendErrorToOrigin(
          originalMsg, 
          "edit" .. self.name .. ": unique constraint violation"
        )
      end
      return msgHelper.sendErrorToOrigin(originalMsg, "edit" .. self.name .. ": " .. err)
    end

    -- When pcall succeeds, result contains the rowsAffected value
    local rowsAffected = result

    if rowsAffected == 0 then
      -- Rollback transaction - nothing changed
      DbClient:exec("ROLLBACK")

      return msgHelper.sendErrorToOrigin(
        originalMsg, 
        "edit" .. self.name .. ": " .. self.name .. " not found or no changes needed"
      )
    end

    -- Custom post-edit hook
    local hook_success = true
    local hook_error = nil

    if self.config.afterEdit then
      local results = DbClient:select("SELECT * FROM " .. self.tableName .. " WHERE id = ?", {validId})
      if results and results[1] then
        hook_success, hook_error = pcall(function()
          return self.config.afterEdit(validId, results[1], originalMsg)
        end)
      end
    end

    -- Commit or rollback based on hook success
    if hook_success == true then
      DbClient:exec("COMMIT")
      msgHelper.sendSuccessToOrigin(originalMsg)
    else
      DbClient:exec("ROLLBACK")

      -- If the hook explicitly returned false, we might have an error message
      if type(hook_success) == "boolean" and hook_success == false and hook_error then
        return msgHelper.sendErrorToOrigin(originalMsg, "edit" .. self.name .. ": " .. hook_error)
      else
        return msgHelper.sendErrorToOrigin(
          originalMsg, 
          "edit" .. self.name .. ": error in afterEdit hook"
        )
      end
    end
  end

  -- Delete entity handler
  function manager:delete(originalMsg)
    local success, errMsg = M.jsonToTable(originalMsg, "delete" .. self.name)
    if not success then
      return msgHelper.sendErrorToOrigin(originalMsg, errMsg)
    end

    local deleteData = msgHelper.requireFieldsOrError(
      originalMsg,
      originalMsg.Data,
      {"id"},
      "delete" .. self.name,
      "origin"
    )
    if not deleteData then return end

    -- Validate ID
    local validId = M.validateAndTransformField(
      self.schema,
      "id",
      deleteData.id,
      "delete" .. self.name,
      originalMsg
    )
    if not validId then return end -- Error already sent

    -- Only fetch the record if we have a beforeDelete hook that needs it
    if self.config.beforeDelete then
      local existingResults = DbClient:select("SELECT * FROM " .. self.tableName .. " WHERE id = ?", {validId})
      if not existingResults or #existingResults == 0 then
        return msgHelper.sendErrorToOrigin(
          originalMsg, 
          "delete" .. self.name .. ": " .. self.name .. " not found"
        )
      end

      local canDelete = self.config.beforeDelete(validId, existingResults[1], originalMsg)
      if canDelete == false then return end -- Hook prevented deletion
    end

    -- Execute delete
    local success, result = pcall(function()
      return DbClient:apply("DELETE FROM " .. self.tableName .. " WHERE id = ?", {validId})
    end)

    if not success then
      local err = result -- When pcall fails, result contains the error
      if err and err:find("FOREIGN KEY constraint failed") then
        return msgHelper.sendErrorToOrigin(
          originalMsg, 
          "delete" .. self.name .. ": Cannot delete because this " .. 
          string.lower(self.name) .. " is referenced by other records"
        )
      end
      return msgHelper.sendErrorToOrigin(originalMsg, "delete" .. self.name .. ": " .. err)
    end

    -- When pcall succeeds, result contains the rowsAffected value
    local rowsAffected = result

    if rowsAffected == 0 then
      return msgHelper.sendErrorToOrigin(
        originalMsg, 
        "delete" .. self.name .. ": " .. self.name .. " not found"
      )
    end

    msgHelper.sendSuccessToOrigin(originalMsg)
  end

  function manager:adminActionHandler(msg)
    local success, errMsg = M.jsonToTable(msg, "admin" .. self.name)
    if not success then
      return msgHelper.errorReply(msg, errMsg)
    end

    if not self.authClient then
      error(self.name .. " manager: authClient is required for admin actions")
    end

    self.authClient.initiateAdminCheck(msg, _G.PendingAdminActions, self.name .. "Manager")
  end

  function manager:handleAuthCheckReply(msg)
    local success, errMsg = M.jsonToTable(msg, "authCheck" .. self.name)
    if not success then
      return msgHelper.errorReply(msg, errMsg)
    end

    if not _G.PendingAdminActions then
      _G.PendingAdminActions = {}
    end

    local originalMsg, isAdmin = self.authClient.handleAuthReply(msg, _G.PendingAdminActions)

    if not originalMsg or not isAdmin then
      return -- Error occurred. Stop processing.
    end

    -- If we reach here, the user is authorized. Proceed with the original action.
    local action = originalMsg.Tags["Action"]
    if action == "Create" .. self.name then
      self:create(originalMsg)
    elseif action == "Edit" .. self.name then
      self:edit(originalMsg)
    elseif action == "Delete" .. self.name then
      self:delete(originalMsg)
    else
      msgHelper.sendErrorToOrigin(
        originalMsg, 
        "Unknown " .. string.lower(self.name) .. " action: " .. (action or "nil")
      )
    end
  end

  -- Helper to find by ID
  function manager:findById(id)
    id = tonumber(id)
    if not id then return nil end
    
    local results = DbClient:select("SELECT * FROM " .. self.tableName .. " WHERE id = ?", {id})
    if results and #results > 0 then
      return results[1], id
    end
    return nil, nil
  end

  -- Return configured manager
  return manager
end

return M