# 📊 Dashboard & Reports with Chart.js

## Overview

Comprehensive dashboard and reports system with interactive charts using Chart.js for visualizing expense trends and analytics.

---

## Features

### 1. Dashboard Page (`/dashboard`)

Overview of user's financial status across all groups.

**Key Metrics:**
- **Your Balance** - Net balance (amount owed or owing)
- **You Paid** - Total amount paid out
- **You Owe** - Total amount owing
- **Groups** - Number of groups user is member of
- **Expenses** - Total number of expenses
- **Members** - Total members across all groups
- **Avg Expense** - Average expense per transaction

**UI Elements:**
- Large balance card (green if owed, red if owing)
- 6 stat cards with emojis
- Quick links to Groups and Reports pages

### 2. Reports Page (`/reports`)

Detailed analytics with interactive charts.

**Charts:**
1. **Pie Chart** - Expenses by category
2. **Bar Chart** - Expenses by person (who paid)
3. **Line Chart** - Monthly trend
4. **Top Expenses List** - Last 10 expenses

**Summary Cards:**
- Total expenses amount
- Number of expenses
- Average expense value

---

## API Endpoints

### Dashboard Stats

```
GET /api/dashboard/stats
```

**Response:**
```json
{
  "totalBalance": 150.50,
  "totalOwed": 300.00,
  "totalOwing": 149.50,
  "groupsCount": 3,
  "expensesCount": 24,
  "membersCount": 12
}
```

**Features:**
- ✅ Authenticated endpoint
- ✅ Calculates all stats from user's groups
- ✅ 5-minute cache (Cache-Control)
- ✅ Aggregates expenses and settlements

### Reports Analytics

```
GET /api/reports?groupId=[optional]
```

**Query Parameters:**
- `groupId` (optional) - Filter by specific group

**Response:**
```json
{
  "totalExpenses": 1250.50,
  "count": 24,
  "byCategory": {
    "FOOD": 450.00,
    "TRANSPORT": 200.00,
    "ACCOMMODATION": 500.00,
    "OTHER": 100.50
  },
  "byMonth": {
    "2024-01": 400.00,
    "2024-02": 850.50
  },
  "topExpenses": [
    {
      "id": "exp-123",
      "description": "Hotel booking",
      "amount": 500.00,
      "category": "ACCOMMODATION",
      "date": "2024-02-20",
      "payer": "Alice",
      "group": "Trip Group"
    }
  ],
  "byUser": {
    "Alice": 750.00,
    "Bob": 400.00,
    "Charlie": 100.50
  }
}
```

**Features:**
- ✅ Authenticated endpoint
- ✅ IDOR protection (only member data)
- ✅ Groupid validation
- ✅ 10-minute cache
- ✅ Multi-dimensional analytics

---

## Dashboard Components

### Main Balance Card

```typescript
<div className={`${isOwing ? 'bg-red-600' : 'bg-green-600'}`}>
  <p>Your Balance</p>
  <p className="text-5xl font-bold">${absBalance.toFixed(2)}</p>
  <p>{isOwing ? 'You owe' : 'You are owed'} money</p>
</div>
```

- Color-coded: Green (owed), Red (owing)
- Prominent large display
- Clear status message

### Stat Cards

```typescript
<div className="grid grid-cols-3 gap-6">
  {/* Paid, Owing, Groups, Expenses, Members, Avg */}
</div>
```

- 6 cards in responsive grid
- Icon for each metric
- Bold numbers for emphasis

### Quick Links

```typescript
<Link href="/groups">Manage Groups</Link>
<Link href="/reports">View Reports</Link>
```

- Navigation shortcuts
- Consistent styling
- Hover effects

---

## Reports Components

### Chart.js Integration

**Registered Elements:**
```typescript
ChartJS.register(
  ArcElement,           // Pie
  CategoryScale,        // Axes
  LinearScale,          // Axes
  BarElement,           // Bar chart
  LineElement,          // Line chart
  PointElement,         // Data points
  Title,                // Chart titles
  Tooltip,              // Hover info
  Legend                // Legend
);
```

### Pie Chart (Categories)

```typescript
const pieData = {
  labels: Object.keys(data.byCategory),
  datasets: [{
    data: Object.values(data.byCategory),
    backgroundColor: ['#16a34a', '#3b82f6', ...]
  }]
};

<Pie data={pieData} options={chartOptions} />
```

- Shows expense breakdown by category
- Color-coded segments
- Legend at bottom

### Bar Chart (By Person)

```typescript
const barData = {
  labels: Object.keys(data.byUser),
  datasets: [{
    label: 'Total Paid',
    data: Object.values(data.byUser),
    backgroundColor: '#16a34a'
  }]
};

<Bar data={barData} options={chartOptions} />
```

- Shows who paid what
- Green bars for clarity
- Sortable by amount

### Line Chart (Monthly Trend)

```typescript
const lineData = {
  labels: Object.keys(data.byMonth),
  datasets: [{
    label: 'Monthly Expenses',
    data: Object.values(data.byMonth),
    borderColor: '#16a34a',
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    tension: 0.4,
    fill: true
  }]
};

<Line data={lineData} options={chartOptions} />
```

- Shows spending trends over time
- Filled area under line
- Smooth curve (tension: 0.4)

### Top Expenses Table

```typescript
{data.topExpenses.map((exp) => (
  <div key={exp.id} className="flex justify-between">
    <div>
      <p>{exp.description}</p>
      <p className="text-sm">{exp.payer} • {exp.category}</p>
    </div>
    <p className="font-bold">${exp.amount.toFixed(2)}</p>
  </div>
))}
```

- Last 10 largest expenses
- Shows payer and category
- Formatted amounts

---

## Data Flow

### Dashboard Stats

```
GET /api/dashboard/stats
  ↓
Get user's groups
  ↓
For each group:
  - Get all expenses
  - For each expense:
    - If user paid: add to totalOwed
    - If user in splits: add split amount to totalOwing
  ↓
Calculate: netBalance = totalOwed - totalOwing
  ↓
Return stats object
```

### Reports Data

```
GET /api/reports?groupId=[optional]
  ↓
Validate group membership (if groupId provided)
  ↓
Get all expenses from user's groups (or filtered group)
  ↓
Aggregate by:
  - Category
  - Month (YYYY-MM)
  - User (payer)
  - Top 10 by amount
  ↓
Return analytics object
```

---

## Technology Stack

### Dependencies

```json
{
  "react": "^19.0.0",
  "react-chartjs-2": "^5.2.0",
  "chart.js": "^4.4.0",
  "next": "^14.0.0"
}
```

### Chart.js Features Used

- Pie Chart - Category breakdown
- Bar Chart - Person comparison
- Line Chart - Temporal trend
- Legend - Data identification
- Tooltip - Hover information
- Responsive - Mobile-friendly

---

## Performance Considerations

### Caching Strategy

| Endpoint | Cache | Duration | Reason |
|----------|-------|----------|--------|
| /dashboard/stats | 5 min | Public | Stats change infrequently |
| /api/reports | 10 min | Public | Analytics stable |

### Data Optimization

- Single query for expenses (with includes)
- Client-side aggregation
- Limit top 10 expenses
- Group calculations

### Memory Usage

- No large data structures
- Chart.js handles rendering
- Responsive image sizing

---

## Error Handling

### Dashboard Errors

```typescript
if (isLoading) {
  return <LoadingSpinner />;
}

if (error || !stats) {
  return <ErrorMessage error={error} />;
}
```

### Reports Errors

```typescript
if (!response.ok) {
  throw new Error('Failed to fetch reports');
}

try {
  // fetch and process
} catch (err) {
  return <ErrorDisplay error={err.message} />;
}
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| No data showing | No expenses yet | Show empty state |
| Chart not rendering | Missing data | Provide default data |
| Slow load | Large dataset | Use pagination |

---

## Usage Examples

### Accessing Dashboard

```
URL: http://localhost:3000/dashboard

Returns:
- User's financial balance
- Statistics about expenses
- Quick navigation links
```

### Accessing Reports

```
URL: http://localhost:3000/reports

Shows:
- Pie chart of spending by category
- Bar chart of who paid
- Line chart of spending over time
- Table of top expenses

Optional filter:
http://localhost:3000/reports?groupId=group-123
```

### API Integration

```typescript
// Get dashboard stats
const stats = await fetch('/api/dashboard/stats').then(r => r.json());

// Get reports data
const reports = await fetch('/api/reports').then(r => r.json());

// Get reports for specific group
const groupReports = await fetch(
  '/api/reports?groupId=group-123'
).then(r => r.json());
```

---

## Customization

### Change Colors

```typescript
// In page.tsx
backgroundColor: [
  '#16a34a',  // Green
  '#3b82f6',  // Blue
  '#f59e0b',  // Amber
  '#ef4444',  // Red
  // Add more colors
]
```

### Add New Chart Type

```typescript
// Import from chart.js
import { RadarElement } from 'chart.js';

// Register
ChartJS.register(RadarElement);

// Use in component
<Radar data={radarData} />
```

### Modify Time Period

```typescript
// Change from monthly to weekly
const week = exp.date.toISOString().slice(0, 10); // YYYY-MM-DD

// Or yearly
const year = exp.date.getFullYear();
```

---

## Security

### Authentication

- ✅ All endpoints require login
- ✅ Session validation

### Authorization

- ✅ Only user's groups visible
- ✅ IDOR validation for groupId
- ✅ No cross-user data leakage

### Validation

- ✅ GroupId validation
- ✅ Membership check
- ✅ Input sanitization

---

## Mobile Responsiveness

### Breakpoints

- **Mobile** (< 768px) - Single column layout
- **Tablet** (768px - 1024px) - 2 columns
- **Desktop** (> 1024px) - 3+ columns

### Chart Responsive

```typescript
{
  responsive: true,
  maintainAspectRatio: true,
  // Charts adjust to container
}
```

---

## Future Enhancements

- [ ] Export reports to PDF
- [ ] Email report delivery
- [ ] Custom date range filters
- [ ] Budget alerts and warnings
- [ ] Recurring expense patterns
- [ ] Savings goals tracking
- [ ] Spending predictions
- [ ] Comparative analytics
- [ ] Real-time updates (WebSocket)
- [ ] Mobile app version

---

## Resources

- [Chart.js Documentation](https://www.chartjs.org/docs/latest/)
- [react-chartjs-2 GitHub](https://github.com/reactchartjs/react-chartjs-2)
- [Chart Types](https://www.chartjs.org/docs/latest/charts/doughnut.html)
- [Data Visualization Best Practices](https://www.interaction-design.org/literature/article/information-visualization)
