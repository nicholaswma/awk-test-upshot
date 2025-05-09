local json = require("json")
local M = {}
local RESPONSE = {
  SUCCESS = "true",
  FAILURE = "false"
}

function M.sendErrorToOrigin(originalMsg, errorMessage)
  ao.send({
    Target = originalMsg.From,
    Data = json.encode({
      Success = RESPONSE.FAILURE,
      Error = errorMessage,
      originalMsgId = originalMsg.Id
    })
  })
end

function M.sendSuccessToOrigin(originalMsg, data)
  data = data or {} -- Default to empty table if data is nil
  data.Success = RESPONSE.SUCCESS
  ao.send({
    Target = originalMsg.From,
    Data = json.encode(data)
  })
end

function M.successReply(msg, data)
  data = data or {} -- Default to empty table if data is nil
  data.Success = RESPONSE.SUCCESS
  msg.reply({ Data = data })
end

function M.errorReply(msg, errorMessage, data)
  data = data or {} -- Default to empty table if data is nil
  data.Success = RESPONSE.FAILURE
  data.Error = errorMessage
  msg.reply({ Data = data })
end

function M.requireFields(data, requiredFields, errorPrefix)
  errorPrefix = errorPrefix or "Validation error"
  
  -- Default to empty table if data is nil
  data = data or {}
  
  -- Safely decode JSON if data is a string
  if type(data) == "string" then
    local success, result = pcall(json.decode, data)
    if not success then
      return nil, errorPrefix .. ": invalid JSON format"
    end
    data = result
  end

  -- Validate data is a table
  if type(data) ~= "table" then
    local errorMsg = errorPrefix .. ": expected table data"
    return nil, errorMsg
  end

  -- Check for required fields
  local missingFields = {}
  for _, field in ipairs(requiredFields) do
    if data[field] == nil then
      table.insert(missingFields, field)
    end
  end

  if #missingFields > 0 then
    local errorMsg = errorPrefix .. ": missing required fields: " .. table.concat(missingFields, ", ")
    return nil, errorMsg
  end

  return data
end

function M.requireFieldsOrError(msg, data, requiredFields, errorPrefix, errorDestination, errorData)
  errorDestination = errorDestination or "reply" -- Default to reply

  local validatedData, errorMsg = M.requireFields(data, requiredFields, errorPrefix)

  if not validatedData then
    if errorDestination == "reply" then
      M.errorReply(msg, errorMsg, errorData)
    end
    if errorDestination == "origin" then
      M.sendErrorToOrigin(msg, errorMsg)
    end
    return nil
  end

  return validatedData
end

return M