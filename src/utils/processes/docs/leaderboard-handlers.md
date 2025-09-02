# Handlers in src/modules/leaderboard_manager.lua

## Leaderboard Stats Structure

```json
{
    "id": 1,
    "player_address": "3lOWXrKJ-58YfD76zLhfVdlM6RpJ2ZuuEgG8Q5OJWI8",
    "total_rank_points": 1500,
    "cards_owned": 45,
    "packs_opened": 12,
    "total_spent": 2400,
    "wins": 28,
    "losses": 7,
    "last_activity_date": 1672531200,
    "created_at": 1672531200,
    "updated_at": 1672531200
}
```

## ListLeaderboardStats

**Authentication**: No authentication required

### Input

```json
{
    "Action": "ListLeaderboardStats",
    "Data": {
        // Data section optional
        "filters": {
            // Defaults to no filters if not specified
            "total_rank_points[gte]": 100, // Greater than or equal to 100 points
            "total_rank_points[lte]": 2000, // Less than or equal to 2000 points
            "total_rank_points[gt]": 50, // Greater than 50 points
            "total_rank_points[lt]": 1000, // Less than 1000 points
            "total_rank_points[ne]": 500, // Not equal to 500 points
            "player_address": "3lOWXrKJ-58YfD76zLhfVdlM6RpJ2ZuuEgG8Q5OJWI8", // Exact match
            "cards_owned[gte]": 10, // At least 10 cards owned
            "wins[gt]": 20 // More than 20 wins
        },
        "page": 1, // Defaults to 1 if not specified
        "pageSize": 10, // Defaults to 10 if not specified
        "sortBy": "-total_rank_points" // Defaults to "-total_rank_points" (descending) if not specified
    }
}
```

### Supported Filter Operators

- `[gte]`: Greater than or equal to
- `[lte]`: Less than or equal to
- `[gt]`: Greater than
- `[lt]`: Less than
- `[ne]`: Not equal to
- No operator: Exact equality match

### Supported Sort Fields

- `total_rank_points` (default, descending)
- `cards_owned`
- `packs_opened`
- `total_spent`
- `wins`
- `losses`
- `last_activity_date`
- `created_at`
- `updated_at`

Use `-` prefix for descending sort (e.g., `-total_rank_points`)

### Output

```json
"Data": {
  "leaderboard_stats": [
    {
      "id": 1,
      "player_address": "3lOWXrKJ-58YfD76zLhfVdlM6RpJ2ZuuEgG8Q5OJWI8",
      "total_rank_points": 1500,
      "cards_owned": 45,
      "packs_opened": 12,
      "total_spent": 2400,
      "wins": 28,
      "losses": 7,
      "last_activity_date": 1672531200,
      "created_at": 1672531200,
      "updated_at": 1672531200
    },
    {
      "id": 2,
      "player_address": "ABC123def456ghi789jkl012mno345pqr678stu901vwx",
      "total_rank_points": 1200,
      "cards_owned": 32,
      "packs_opened": 8,
      "total_spent": 1800,
      "wins": 22,
      "losses": 12,
      "last_activity_date": 1672444800,
      "created_at": 1672444800,
      "updated_at": 1672444800
    },
    ...
  ]
}
```

### Example Queries

#### Get top 10 players by rank points

```json
{
    "Action": "ListLeaderboardStats",
    "Data": {
        "page": 1,
        "pageSize": 10,
        "sortBy": "-total_rank_points"
    }
}
```

#### Get players with more than 100 rank points

```json
{
    "Action": "ListLeaderboardStats",
    "Data": {
        "filters": {
            "total_rank_points[gte]": 100
        },
        "sortBy": "-total_rank_points"
    }
}
```

#### Get specific player stats

```json
{
    "Action": "ListLeaderboardStats",
    "Data": {
        "filters": {
            "player_address": "3lOWXrKJ-58YfD76zLhfVdlM6RpJ2ZuuEgG8Q5OJWI8"
        }
    }
}
```

#### Get players with high win rates (more than 20 wins and fewer than 10 losses)

```json
{
    "Action": "ListLeaderboardStats",
    "Data": {
        "filters": {
            "wins[gt]": 20,
            "losses[lt]": 10
        },
        "sortBy": "-wins"
    }
}
```

### Notes

- Results are paginated with default page size of 10
- Default sorting is by `total_rank_points` in descending order (highest first)
- All numeric fields support comparison operators for flexible filtering
- The `player_address` field supports exact matching only
- Timestamps are stored as Unix timestamps (seconds since epoch)

