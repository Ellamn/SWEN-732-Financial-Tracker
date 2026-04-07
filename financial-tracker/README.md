# FinancialTracker — Student Finance App

A financial budgeting and tracking web app built for college students.

## Setup

1. Install dependencies:
```bash
npm install recharts
```
> All other dependencies (React, etc.) should already be in your blank React app.

2. Copy the `src/` files from this package into your project's `src/` directory.

3. Run the app:
```bash
npm start
```

## File Structure

```
src/
├── App.jsx              # Main app shell with routing
├── App.css              # Global design system styles
├── components/
│   ├── Sidebar.jsx      # Navigation sidebar
│   └── Sidebar.css
├── data/
│   └── fakeData.js      # Fake data (replace with Flask API calls)
└── pages/
    ├── Dashboard.jsx    # Main overview: balance, charts, rollover
    ├── Transactions.jsx # Transaction log with add/filter/delete
    ├── Budget.jsx       # Paycheck splitter + budget limits
    ├── Goals.jsx        # Savings goals with progress tracking
    └── Savings.jsx      # Future savings projections
```

## Features Implemented

| User Story | Feature |
|---|---|
| #1 | Bank balance input with inline editing |
| #2 | Pie charts for spending categories and income sources |
| #3 | Paycheck splitter with category percentages |
| #4 | Date range filter (week/month/year) on dashboard |
| #5 | Savings goals with progress bars and quick-add buttons |
| #6 | Savings plan projector with interest rate and goal timeline |
| #7 | Over-budget alerts on dashboard and budget page |
| #8 | Monthly rollover bar chart and cumulative table |
| #9 | Income categorization (job, aid, freelance, etc.) |
| #10 | Expense categorization with tags and filters |
| #11 | Clean, minimal dark-mode UI designed for students |

## Connecting to Flask API

Replace the imports from `../data/fakeData.js` with `fetch()` calls to your Flask endpoints. For example:

```js
// Instead of:
import { transactions } from "../data/fakeData";

// Use:
const [transactions, setTransactions] = useState([]);
useEffect(() => {
  fetch("http://localhost:5000/api/transactions")
    .then(r => r.json())
    .then(setTransactions);
}, []);
```
