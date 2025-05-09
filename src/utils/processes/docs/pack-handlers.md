# Handlers in src/modules/pack_manager.lua

## Pack Spec Structure

```json
{
  "id": 1,
  "pack_name": "Sports pack",
  "image": "arweave-tx-hash",
  "description": "Pack which draws randomly from all sport related events.",
  "status": "active",   // Status: "active", "coming soon", or "archived"
  "category_ids": [1, 2],
  "eventIds": [1, 2]
}
```

## ListPacks

**Authentication**: No authentication required

**Input:**

```json
{
  "Action": "ListPacks",
  "Data": {        // Data section optional
    "filters": {   // Defaults to no filters if not specified
      "status": "active"
    },
    "page": 1,      // Defaults to 1 if not specified
    "pageSize": 10, // Defaults to 10 if not specified
    "sortBy": "-id" // Defaults to "-id" (descending id) if not specified
  }
}
```

**Output:**

```json
"Data": {
  "packs": [
    {
      "id": 1,
      "pack_name": "Sports pack",
      "image": "arweave-tx-hash",
      "description": "Pack which draws randomly from all sport related events.",
      "status": "active",
      "category_ids": [1, 2],
      "eventIds": [1, 2]
    },
    {
      "id": 2,
      "pack_name": "Politics pack",
      "image": "arweave-tx-hash",
      "description": "Pack which draws randomly from all political events.",
      "status": "active",
      "category_ids": [3],
      "eventIds": [3, 4, 5]
    },
    ...
  ]
}
```

## CreatePack

**Authentication**: Admin authentication required

**Input:**

```json
{
  "Action": "CreatePack",
  "Data": {
    "pack_name": "New Pack",
    "image": "arweave-tx-hash",
    "description": "Description of the new pack",
    "status": "active",
    "category_ids": [1, 2],
    "eventIds": [1, 2, 3]
  }
}
```

All fields are required except `image`, `category_ids`, and `eventIds` which is optional. If eventIds are not provided, the pack will draw from all packs from the provided categories.

**Output:**

```json
"Data": { "Success": "true" }
```

**Possible Error Responses:**

- Invalid pack data
- Pack name already exists
- Authentication failed
- Referenced categories or events don't exist

## EditPack

**Authentication**: Admin authentication required

**Input:**

```json
{
  "Action": "EditPack",
  "Data": {
    "id": 1,
    "pack_name": "Updated Pack Name",       // Optional
    "image": "arweave-tx-hash",             // Optional
    "description": "Updated description",   // Optional
    "status": "coming soon",                // Optional
    "category_ids": [1, 2, 3],              // Optional
    "eventIds": [1, 2, 3, 4]                // Optional
  }
}
```

Only `id` is required, all other fields are optional.

**Output:**

```json
"Data": { "Success": "true" }
```

**Possible Error Responses:**

- Pack not found
- Invalid edit data
- Authentication failed
- Referenced categories or events don't exist

## DeletePack

**Authentication**: Admin authentication required

**Input:**

```json
{
  "Action": "DeletePack",
  "Data": {
    "id": 1
  }
}
```

**Output:**

```json
"Data": { "Success": "true" }
```

**Possible Error Responses:**

- Pack not found
- Authentication failed
