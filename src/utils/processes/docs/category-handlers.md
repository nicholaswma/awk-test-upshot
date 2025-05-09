# Handlers in src/modules/category_manager.lua

## Category Structure

```json
{
    "id": 1,
    "category_name": "Sports",
    "image": "arweave-tx-hash",
    "color_gradient": "color_gradientCss",
    "status": "active", // Status: "active", "coming soon", or "archived"
    "sort_order": 1
}
```

## ListCategories

**Authentication**: No authentication required

**Input:**

```json
{
  "Action": "ListCategories",
  "Data": {        // Data section optional
    "filters": {   // Defaults to no filters if not specified
      "status": "active"
    },
    "page": 1,             // Defaults to 1 if not specified
    "pageSize": 10,        // Defaults to 10 if not specified
    "sortBy": "sort_order" // Defaults to "sort_order" (ascending id) if not specified
  }
}
```

**Output:**

```json
"Data": {
  "categories": [
    {
        "id": 1,
        "category_name": "Sports",
        "image": "arweave-tx-hash",
        "color_gradient": "color_gradientCss",
        "status": "active",
        "sort_order": 1
    },
    {
        "id": 2,
        "category_name": "Politics",
        "image": "arweave-tx-hash",
        "color_gradient": "color_gradientCss",
        "status": "active",
        "sort_order": 2
    },
    ...
  ]
}
```

## CreateCategory

**Authentication**: Admin authentication required

**Input:**

```json
{
    "Action": "CreateCategory",
    "Data": {
        "category_name": "NewCategory",
        "image": "arweave-tx-hash",
        "color_gradient": "color_gradientCss",
        "status": "active",
        "sort_order": 1
    }
}
```

All fields are optional except for `category_name`

**Output:**

```json
"Data": { "Success": "true" }
```

## EditCategory

**Authentication**: Admin authentication required

**Input:**

```json
{
    "Action": "EditCategory",
    "Data": {
        "id": 4,
        "category_name": "New Name",
        "image": "arweave-tx-hash",
        "status": "New Status",
        "sort_order": 5
    }
}
```

All fields are optional except for `id`

**Output:**

```json
"Data": { "Success": "true" }
```

## DeleteCategory

**Authentication**: Admin authentication required

**Input:**

```json
{ "Action": "DeleteCategory", "Data": { "id": 4 } }
```

**Output:**

```json
"Data": { "Success": "true" }
```
