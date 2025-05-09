# Handlers in src/modules/event_manager.lua

## Event Structure

```json
{
  "id": 1,
  "event_name": "Superbowl 2026 Winner",
  "category_ids": [1, 2, 3],
  "image": "arweave-tx-hash",
  "description": "Who will win the Superbowl in 2026?", 
  "rules": "Winner data will be sourced from the NFL official website (NFL.com)",
  "status": "active",        // Status: "active", "pending resolution", "resolved", "draft"
  "event_date": 1759680000,  // Unix timestamp of the event date
  "outcomes": ["Buffalo Bills", "New York Giants"],
  "winning_outcome": "New York Giants" // null if not resolved yet
}
```

## Listing Events

**Request:**

```json
{
  "Action": "ListEvents",
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

**Response:**

```json
{
  "events": [
    {
      "id": 3,
      "event_name": "2024 US Presidential Election Winner",
      "category_ids": [1, 2, 3],
      "image": "arweave-tx-hash",
      "description": "description",
      "rules": "rules",
      "status": "resolved",
      "event_date": 1730851200,
      "outcomes": ["Donald Trump", "Kamala Harris"],
      "winning_outcome": "Donald Trump"
    },
    {
      "id": 2,
      "event_name": "Highest grossing movie in 2025",
      "category_ids": [1, 2, 3],
      "image": "arweave-tx-hash",
      "description": "description",
      "rules": "rules",
      "status": "active",
      "event_date": 1767225600,
      "outcomes": ["Minecraft Movie", "Zootopia 2", "Lilo & Stitch", "Avatar 3", "Superman", "Other Movie"],
      "winning_outcome": null
    },
    ...
  ]
}
```

Events are returned in descending order by id (newest first).

## Creating an Event

**Authentication**: Admin authentication required

**Request:**

```json
{
  "Action": "CreateEvent",
  "Data": {
    "id": 2,
    "event_name": "New Event Name",
    "category_ids": [1, 2, 3],
    "image": "arweave-tx-hash",
    "description": "Event description",
    "rules": "Event rules",
    "status": "active",
    "event_date": 1767225600,
    "outcomes": ["Outcome1", "Outcome2"],
    "winning_outcome": null
  }
}
```

**Response (Success):**

```json
{ "Success": "true" }
```

**Possible Error Responses:**

- Invalid event data
- Event name already exists
- Authentication failed

## Editing an Event

**Authentication**: Admin authentication required

**Request:**

```json
{
  "Action": "EditEvent",
  "Data": {
    "id": 2,
    "event_name": "Updated Event Name",     // Optional
    "category_ids": [1, 2, 3],              // Optional
    "image": "arweave-tx-hash",             // Optional
    "description": "New description",       // Optional
    "rules": "Updated rules",               // Optional
    "status": "resolved",                   // Optional
    "event_date": 1767225600,               // Optional
    "outcomes": ["Outcome1", "Outcome2"],   // Optional
    "winning_outcome": null                 // Optional
  }
}
```

**Response (Success):**

```json
{ "Success": "true" }
```

**Possible Error Responses:**

- Event not found
- Invalid edit data
- Event date must be a timestamp number
- Authentication failed

### Deleting an Event

**Authentication**: Admin authentication required

**Request:**

```json
{
  "Action": "DeleteEvent",
  "Data": {
    "id": 2
  }
}
```

**Response (Success):**

```json
{ "Success": "true" }
```

**Possible Error Responses:**

- Event not found
- Invalid delete data
- Authentication failed
