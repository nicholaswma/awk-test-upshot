local json = require("json")
local msgHelper = require("lib.msg_helper")
local M = {}
local authProcessId = "AUTH_MANAGER_PROCESS_ID" -- Set via Github Actions variable

--- Configures the Auth Client library with the necessary Process ID.
-- This is used for testing purposes. The process ID will normally be set by Github actions.
-- @param authProcessIdInput The Process ID of the Auth process.
function M.configure(authProcessIdInput)
  authProcessId = authProcessIdInput
end

--- Gets the configured Auth Process ID.
-- Used primarily for registering the reply handler in the consuming process.
-- @return string The configured Auth Process ID or nil if not configured.
function M.getAuthProcessId()
  if authProcessId == "AUTH_MANAGER_PROCESS_ID" then
    return nil
  end
  return authProcessId
end

--- Initiates an admin check by sending a message to the configured Auth process.
-- @param msg The original incoming message triggering the check.
-- @param pendingActions The table used to store pending requests (e.g., PendingAdminActions).
-- @return boolean True if the check was initiated successfully, false otherwise.
function M.initiateAdminCheck(msg, pendingActions, moduleName)
  if authProcessId == "AUTH_MANAGER_PROCESS_ID" then
    msgHelper.sendErrorToOrigin(msg, "Auth process not configured")
    return false
  end
  pendingActions[msg.Id] = msg
  ao.send({
    Target = authProcessId,
    Action = "CheckAdmin",
    Data = json.encode({
      address = msg.Owner,
      originalMsgId = msg.Id,
      moduleName = moduleName,
    })
  })
  return true
end

--- Handles the reply message from the Auth process.
-- Checks for errors, authorization status, and retrieves the original message context.
-- @param replyMsg The reply message received from the Auth process.
-- @param pendingChecksTable The table where pending requests were stored.
-- @return originalMsg The original message context if the check was valid so far, otherwise nil.
-- @return isAdmin Boolean indicating admin status if check succeeded and user is admin, false if not admin, nil if error occurred.
function M.handleAuthReply(replyMsg, pendingChecksTable)
  local data = msgHelper.requireFieldsOrError(
    replyMsg,
    replyMsg.Data,
    {"originalMsgId"},
    "handleAuthReply"
  )
  if not data then return nil, nil end

  local originalMsg = pendingChecksTable[data.originalMsgId]
  if not originalMsg then
    msgHelper.errorReply(replyMsg, "Invalid reply: Unknown originalMsgId")
    return nil, nil
  end

  -- Clean up the pending request
  pendingChecksTable[data.originalMsgId] = nil

  -- Check 1: Did the Auth process itself report success?
  if data.Success == "false" then
    local authError = data.Error or "Auth check failed"
    msgHelper.sendErrorToOrigin(originalMsg, authError)
    return originalMsg, nil
  end

  -- Check 2: Is the user an admin according to the Auth process?
  if not data.isAdmin then
    msgHelper.sendErrorToOrigin(originalMsg, "Unauthorized: Admins only")
    return originalMsg, false
  end

  -- If we reach here, the auth check was successful and the user is an admin.
  return originalMsg, true
end

return M