# Handlers in src/auth_manager.lua

## ListUsers

**Authentication**: Admin authentication required

**Input:**

```text
# List all users
Send({ Target = "processId", Action = "ListUsers" })

# List users with a specific role (e.g., 'admin')
Send({ Target = "processId", Action = "ListUsers", Data = { role = "admin" } })
```

**Output:**

```text
Data = {
    userList = {
        {
            name = "Nick"
            address = "QLWtbSUIaxiahzqxkthbHi7HN16QmPd0SQ675ZyO_cE",
            role = "admin",
        },
        {
            name = "Shaun"
            address = "B1zvZ7dfmn64QBsbO7Js1Zo_irEmCBfPyHK2lrUw8bE",
            role = "admin",
        }
    },
    Success = "true"
}
```

## AddUser

**Authentication**: Admin authentication required

**Input:**

```text
Send({ Target = "processId", Action = "AddUser", Data = { address = "new-user-address", name = "New User", role = "admin" } })
```

**Output:**

```text
Data = { Success = "true" }
```

## RemoveUser

**Authentication**: Admin authentication required

**Input:**

```text
Send({ Target = "processId", Action = "RemoveUser", Data = { address = "user-address-to-remove" } })
```

**Output:**

```text
Data = { Success = "true" }
```

## EditUser

**Authentication**: Admin authentication required

**Input:**

```text
Send({ Target = "processId", Action = "EditUser", Data = { address = "user-address-to-edit", name = "Updated Name", role = "admin" } })
```

`address` is required. `name` and `role` are optional fields to update.

**Output:**

```text
Data = { Success = "true" }
```

## CheckAdmin

**Authentication**: No authentication required

**Input:**

```text
Send({ Target = "processId", Action = "CheckAdmin", Data = { address = "address-to-check" } })
```

`address` is required.

**Output:**

```text
Data = {"isAdmin":true}
```
