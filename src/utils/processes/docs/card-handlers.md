# Handlers in src/modules/card_spec_manager.lua

## Card Spec Structure

```json
{
  "id": 1,
  "event_id": 1,
  "card_name": "New York Giants",
  "rarity": "common",       // Rarity: "common", "uncommon", "rare", "legendary"
  "outcome_id": 1,
  "image": "arweave-tx-hash",
  "description": "The New York Giants win the Superbowl in 2026",
  "remaining_supply": 100,
  "max_supply": 100,
  "never_reduce_supply": false
}
```

## ListCards

**Authentication**: No authentication required

### Input

```json
{
  "Action": "ListCards",
  "Data": {        // Data section optional
    "filters": {   // Defaults to no filters if not specified
      "status": "active"
    },
    "page": 1,       // Defaults to 1 if not specified
    "pageSize": 10,  // Defaults to 10 if not specified
    "sortBy": "-id"  // Defaults to "-id" (descending id) if not specified
  }
}
```

### Output

```json
"Data": {
  "cards": [
    {
      "id": 1,
      "event_id": 1,
      "card_name": "New York Giants",
      "rarity": "common",
      "outcome_id": 1,
      "image": "arweave-tx-hash",
      "description": "The New York Giants win the Superbowl in 2026",
      "remaining_supply": 100,
      "max_supply": 100,
      "never_reduce_supply": false
    },
    {
      "id": 2,
      "event_id": 1,
      "card_name": "Kansas City Chiefs",
      "rarity": "uncommon",
      "outcome_id": 2,
      "image": "arweave-tx-hash",
      "description": "The Kansas City Chiefs win the Superbowl in 2026",
      "remaining_supply": 100,
      "max_supply": 100,
      "never_reduce_supply": false
    },
    ...
  ]
}
```

## GetCardsByEvent

**Authentication**: No authentication required

**Input:**

```json
{
  "Action": "GetCardsByEvent",
  "Data": {
    "event_id": 1
  }
}
```

**Ouput:**

```json
"Data": {
  "cards": [
    {
      "id": 1,
      "event_id": 1,
      "card_name": "New York Giants",
      "rarity": "common",
      "outcome_id": 1,
      "image": "arweave-tx-hash",
      "description": "The New York Giants win the Superbowl in 2026",
      "remaining_supply": 100,
      "max_supply": 100,
      "never_reduce_supply": false
    },
    {
      "id": 2,
      "event_id": 1,
      "card_name": "Kansas City Chiefs",
      "rarity": "uncommon",
      "outcome_id": 2,
      "image": "arweave-tx-hash",
      "description": "The Kansas City Chiefs win the Superbowl in 2026",
      "remaining_supply": 100,
      "max_supply": 100,
      "never_reduce_supply": false
    },
    ...
  ]
}
```

**Possible Error Responses:**

- Invalid event_id (must be a valid number)
- Event with the specified ID doesn't exist

## CreateCard

**Authentication**: Admin authentication required

**Input:**

```json
{
  "Action": "CreateCard",
  "Data": {
    "card_name": "New York Giants",
    "rarity": "common",
    "outcome_id": 1,
    "image": "arweave-tx-hash",
    "description": "The New York Giants win the Superbowl in 2026",
    "max_supply": 100,
    "never_reduce_supply": false
  }
}
```

Required fields are `outcome_id`, `card_name`, and `description`.

**Output:**

```json
"Data": { "Success": "true" }
```

**Possible Error Responses:**

- Invalid card data
- Outcome not found
- Card name already exists for this event
- Invalid rarity value
- Authentication failed

## EditCard

**Authentication**: Admin authentication required

**Input:**

```json
{
  "Action": "EditCard",
  "Data": {
    "id": 1,
    "card_name": "Updated Name",           // Optional
    "rarity": "rare",                      // Optional
    "outcome_id": 2,                       // Optional
    "image": "arweave-tx-hash",            // Optional
    "description": "Updated description",  // Optional
    "max_supply": 100,                     // Optional
    "never_reduce_supply": false           // Optional
  }
}
```

Only `id` is required, all other fields are optional.

**Output:**

```json
"Data": { "Success": "true" }
```

**Possible Error Responses:**

- Card not found
- Invalid edit data
- Outcome not found
- Invalid rarity value
- Authentication failed

## DeleteCard

**Authentication**: Admin authentication required

**Input:**

```json
{
  "Action": "DeleteCard",
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

- Card not found
- Authentication failed
