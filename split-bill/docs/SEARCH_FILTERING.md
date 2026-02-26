# 🔍 Search & Filtering Features

## Overview

Advanced search and filtering system for finding expenses with multiple filter options including text search, categories, date ranges, and amount ranges.

---

## Features

### Text Search

Search by expense description using case-insensitive partial matching.

**Example:**
```
Query: "hotel"
Matches: "Hilton Hotel", "hotel booking", "HOTEL RESORT"
```

### Category Filter

Filter expenses by category:
- FOOD
- TRANSPORT
- ACCOMMODATION
- ENTERTAINMENT
- BILLS
- OTHER

### Date Range Filter

Filter by expense date using from/to date inputs.

**Example:**
```
From: 2024-01-01
To: 2024-01-31
Result: All January expenses
```

### Amount Range Filter

Filter by expense amount using min/max values.

**Example:**
```
Min: $50
Max: $200
Result: Expenses between $50-$200
```

### Group Filter

Optionally filter results to specific group (by groupId).

### Pagination

Results support pagination with limit and offset parameters.

---

## API Endpoint

### Search Endpoint

```
GET /api/expenses/search
```

**Query Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| q | string | No | "" | Search query (description) |
| category | string | No | - | Category filter |
| groupId | string | No | - | Filter by group |
| from | date | No | - | Start date (ISO format) |
| to | date | No | - | End date (ISO format) |
| minAmount | number | No | - | Minimum amount |
| maxAmount | number | No | - | Maximum amount |
| limit | number | No | 50 | Results per page (max 100) |
| offset | number | No | 0 | Pagination offset |

**Response:**

```json
{
  "expenses": [
    {
      "id": "exp-123",
      "description": "Hotel booking",
      "amount": "500.00",
      "category": "ACCOMMODATION",
      "date": "2024-02-20T00:00:00Z",
      "payer": {
        "id": "user-1",
        "name": "Alice",
        "email": "alice@example.com"
      },
      "group": {
        "id": "group-1",
        "name": "Trip Group"
      },
      "splits": [
        {
          "id": "split-1",
          "userId": "user-2",
          "user": {
            "id": "user-2",
            "name": "Bob"
          },
          "amount": "250.00"
        }
      ]
    }
  ],
  "total": 42,
  "limit": 50,
  "offset": 0,
  "hasMore": false
}
```

**Features:**
- ✅ Authenticated endpoint (requireAuth)
- ✅ IDOR protection (only user's groups)
- ✅ Parallel queries (expenses + count)
- ✅ No caching (always fresh)
- ✅ Swagger documented

---

## Search Page

**Route:** `/search`

### Filter Inputs

1. **Search Description** - Text input for partial matching
2. **Category** - Dropdown with 6 categories + "All"
3. **Group ID** - Optional group filter
4. **From Date** - Date picker (ISO format)
5. **To Date** - Date picker (ISO format)
6. **Min Amount** - Number input
7. **Max Amount** - Number input

### Buttons

- **Search** - Execute search with current filters
- **Clear Filters** - Reset all fields and results

### Results Display

- Results count (e.g., "Found 42 expenses")
- Expense cards showing:
  - Description
  - Category badge
  - Payer name and group name
  - Date
  - Amount (bold, right-aligned)
  - Participant count

### Empty States

- **No results found** - Shows when search returns 0 results
- **Loading** - Shows spinner while searching
- **Error** - Shows error message if search fails

---

## Usage Examples

### Search by Description

```
URL: /search
Input: "hotel"
Result: All expenses containing "hotel" in description
```

### Filter by Category

```
Query: category=FOOD
Result: All food expenses
```

### Date Range Search

```
Query: from=2024-01-01&to=2024-01-31
Result: All January expenses
```

### Amount Range

```
Query: minAmount=100&maxAmount=500
Result: Expenses between $100-$500
```

### Combined Filters

```
Query: q=dinner&category=FOOD&from=2024-02-01&minAmount=20
Result: Food expenses with "dinner" in description
        from February onwards, minimum $20
```

### API Integration

```typescript
// Search with all filters
const params = new URLSearchParams({
  q: 'hotel',
  category: 'ACCOMMODATION',
  from: '2024-01-01',
  to: '2024-01-31',
  minAmount: '100',
  maxAmount: '500',
  limit: '25',
  offset: '0'
});

const response = await fetch(`/api/expenses/search?${params}`);
const data = await response.json();

console.log(`Found ${data.total} expenses`);
console.log(`Has more: ${data.hasMore}`);
```

---

## Search Algorithm

### Text Matching

```
Query: "hotel"
Database field: description
Algorithm:
  - Case-insensitive partial match
  - PostgreSQL: ILIKE '%hotel%'
  - Prisma: contains: query, mode: 'insensitive'
```

### Date Range

```
From: 2024-01-01
To: 2024-01-31
Algorithm:
  - date >= from AND date <= to
  - Both inclusive
```

### Amount Range

```
Min: $100
Max: $500
Algorithm:
  - amount >= min AND amount <= max
  - Decimal comparison
```

---

## Performance

### Query Optimization

- Single query with includes (no N+1)
- Parallel count query
- Indexed fields: description, category, date, amount
- Pagination reduces results

### Caching

```
Cache-Control: no-cache
```
- Search results not cached
- Always fresh data
- Important for real-time accuracy

### Complexity

- **Time:** O(n) where n = matching expenses
- **Space:** O(limit) results stored
- **Database:** Indexed for fast lookup

---

## Security

### Authentication

- ✅ All requests require login (requireAuth)
- ✅ Session validation

### Authorization

- ✅ IDOR protection (only user's groups)
- ✅ Members can only see their group expenses
- ✅ No cross-user data leakage

### Validation

- ✅ Category enum validation
- ✅ Date format validation
- ✅ Amount range validation (positive)
- ✅ Limit capped at 100 (prevent abuse)
- ✅ Input sanitization

---

## Error Handling

### Common Errors

| Error | Status | Cause | Solution |
|-------|--------|-------|----------|
| Unauthorized | 401 | Not logged in | Login required |
| Invalid category | 400 | Bad category value | Use valid category |
| Invalid date | 400 | Bad date format | Use ISO format |
| Invalid amount | 400 | Negative or non-numeric | Use positive numbers |

### Example Error Response

```json
{
  "error": "Invalid category",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "category",
    "message": "Category must be one of: FOOD, TRANSPORT, etc."
  }
}
```

---

## Mobile Responsiveness

### Breakpoints

- **Mobile** (< 768px)
  - Single column filter grid
  - Full-width inputs
  - Stacked results

- **Tablet** (768px - 1024px)
  - 2-column grid
  - Optimized spacing

- **Desktop** (> 1024px)
  - 3-column grid
  - Side-by-side layout

### Touch Optimization

- Larger input areas
- Clear button labels
- Proper spacing between elements

---

## Advanced Features

### Combine Multiple Filters

```typescript
// User can combine any filters
{
  q: 'restaurant',
  category: 'FOOD',
  groupId: 'trip-2024',
  from: '2024-02-01',
  to: '2024-02-28',
  minAmount: '20',
  maxAmount: '100'
}
```

### Pagination

```typescript
// Get page 2 (50 per page)
{
  limit: 50,
  offset: 50  // Skip first 50
}

// Result indicates if more available
{
  hasMore: true,
  total: 145,
  offset: 50,
  limit: 50
}
```

### Smart Defaults

- Limit defaults to 50 (reasonable amount)
- Capped at 100 (prevent abuse)
- Offset defaults to 0 (first page)
- All filters optional (no required)

---

## UI/UX Patterns

### Filter Card

- White background with shadow
- Grid layout for multiple inputs
- Clear action buttons below

### Results

- Individual cards for each expense
- Left: Description, payer, group, date
- Right: Amount (bold), participant count
- Hover effect for interactivity

### Empty State

- Icon with description
- "No expenses found" message
- Help text: "Try adjusting filters"

### Loading State

- Spinner animation
- Disabled search button
- "Searching..." text

---

## Future Enhancements

- [ ] Saved searches
- [ ] Advanced filters UI
- [ ] Full-text search (description + payer)
- [ ] Sort options (amount, date, payer)
- [ ] Export search results
- [ ] Search suggestions/autocomplete
- [ ] Filter presets
- [ ] Search history

---

## Testing Scenarios

### Basic Search

```
Query: "dinner"
Expected: All expenses with "dinner" in description
```

### Category Only

```
Category: FOOD
Expected: All food expenses
```

### Date Range

```
From: 2024-01-15
To: 2024-01-20
Expected: Expenses in date range (inclusive)
```

### Amount Range

```
Min: 50
Max: 150
Expected: Expenses $50-$150
```

### No Results

```
Query: "xyz123nonexistent"
Expected: Empty results, helpful message
```

### Pagination

```
Limit: 10, Offset: 0
Limit: 10, Offset: 10
Expected: Next 10 results
```

---

## Database Queries

### Indexed Fields

```prisma
// Create indexes for performance
@@index([description])
@@index([category])
@@index([date])
@@index([amount])
@@index([groupId])
```

### Query Pattern

```sql
SELECT * FROM expenses
WHERE
  group_id IN (SELECT group_id FROM group_members
               WHERE user_id = ? AND is_pending = false)
  AND description ILIKE ?
  AND category = ?
  AND date >= ? AND date <= ?
  AND amount >= ? AND amount <= ?
ORDER BY date DESC
LIMIT ? OFFSET ?
```

---

## Resources

- [PostgreSQL ILIKE](https://www.postgresql.org/docs/current/functions-matching.html)
- [Prisma Where Filters](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference#where)
- [Search Best Practices](https://www.smashingmagazine.com/2019/04/search-experience-design/)
