local json = require("json")
local msgHelper = require("lib.msgHelper")

Users = Users or {
    ["B1zvZ7dfmn64QBsbO7Js1Zo_irEmCBfPyHK2lrUw8bE"] = { name = "Shaun", role = "admin" },
    ["QLWtbSUIaxiahzqxkthbHi7HN16QmPd0SQ675ZyO_cE"] = { name = "Nick", role = "admin" }
}

local function isUserRole(address, userRole)
    return Users[address] ~= nil and Users[address].role == userRole
end

local function isAdmin(address)
    return isUserRole(address, "admin")
end

local function requireAdmin(msg)
    if not isAdmin(msg.Owner) then
        msgHelper.errorReply(msg, "Unauthorized: Admins only")
        return false
    end
    return true
end

local function addUser(address, name, userRole)
    Users[address] = { name = name or "", role = userRole or "user" }
end

local function removeUser(address)
    Users[address] = nil
end

local function editUser(address, name, userRole)
    if not Users[address] then return false end
    if name then Users[address].name = name end
    if userRole then Users[address].role = userRole end
    return true
end

local function listUsers(userRole)
    local list = {}
    for addr, info in pairs(Users) do
        if not userRole or info.role == userRole then
            table.insert(list, { address = addr, name = info.name, role = info.role })
        end
    end
    return list
end

-- Handlers for user CRUD operations (restricted to admins)
local function ListUsersHandler(msg)
    if not requireAdmin(msg) then return end

    local userRole = msg.Data and msg.Data.role
    msgHelper.successReply(msg, { userList = listUsers(userRole) })
end

local function AddUserHandler(msg)
    if not requireAdmin(msg) then return end

    local data = msg.Data
    if type(data) ~= "table" or not data.address then
        msgHelper.errorReply(msg, "Missing address")
        return
    end
    addUser(data.address, data.name, data.role)
    msgHelper.successReply(msg)
end

local function RemoveUserHandler(msg)
    if not requireAdmin(msg) then return end

    local data = msg.Data
    if type(data) ~= "table" or not data.address then
        msgHelper.errorReply(msg, "Missing address")
        return
    end
    removeUser(data.address)
    msgHelper.successReply(msg)
end

local function EditUserHandler(msg)
    if not requireAdmin(msg) then return end

    local data = msg.Data
    if type(data) ~= "table" or not data.address then
        msgHelper.errorReply(msg, "Missing address")
        return
    end
    if not Users[data.address] then
        msgHelper.errorReply(msg, "User not found")
        return
    end
    editUser(data.address, data.name, data.role)
    msgHelper.successReply(msg)
end

-- Handler for external processes (like CategoryManager) to enforce admin authentication
local function CheckAdminHandler(msg)
    -- Decode Data if it's a JSON string
    local data = type(msg.Data) == "string" and json.decode(msg.Data) or msg.Data
    local addressToCheck = data and data.address
    if not addressToCheck then
        msgHelper.errorReply(msg, "Missing address to check", { isAdmin = false })
        return
    end
    msgHelper.successReply(msg, { isAdmin = isAdmin(addressToCheck), originalMsgId = data.originalMsgId })
end

Handlers.add("ListUsersHandler", Handlers.utils.hasMatchingTag("Action", "ListUsers"), ListUsersHandler)
Handlers.add("AddUserHandler", Handlers.utils.hasMatchingTag("Action", "AddUser"), AddUserHandler)
Handlers.add("RemoveUserHandler", Handlers.utils.hasMatchingTag("Action", "RemoveUser"), RemoveUserHandler)
Handlers.add("EditUserHandler", Handlers.utils.hasMatchingTag("Action", "EditUser"), EditUserHandler)
Handlers.add("CheckAdmin", Handlers.utils.hasMatchingTag("Action", "CheckAdmin"), CheckAdminHandler)

return {
    users = Users,
    isUserRole = isUserRole,
    isAdmin = isAdmin,
    requireAdmin = requireAdmin,
    addUser = addUser,
    removeUser = removeUser,
    editUser = editUser,
    listUsers = listUsers,
    ListUsersHandler = ListUsersHandler,
    AddUserHandler = AddUserHandler,
    RemoveUserHandler = RemoveUserHandler,
    EditUserHandler = EditUserHandler,
    CheckAdminHandler = CheckAdminHandler,
}