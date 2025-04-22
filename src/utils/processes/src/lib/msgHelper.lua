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
    data = data or {}  -- Default to empty table if data is nil
    data.Success = RESPONSE.SUCCESS
    ao.send({
        Target = originalMsg.From,
        Data = json.encode(data)
    })
end

function M.successReply(msg, data)
    data = data or {}  -- Default to empty table if data is nil
    data.Success = RESPONSE.SUCCESS
    msg.reply({ Data = data })
end

function M.errorReply(msg, errorMessage, data)
    data = data or {}  -- Default to empty table if data is nil
    data.Success = RESPONSE.FAILURE
    data.Error = errorMessage
    msg.reply({ Data = data })
end

return M