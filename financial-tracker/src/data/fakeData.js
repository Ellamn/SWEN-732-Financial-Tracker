// Fake data — replace with Flask API calls

export const accountBalance = 2847.50;

export const monthlyIncome = 2200;
export const monthlyExpenses = 1680;
export const monthlySavings = monthlyIncome - monthlyExpenses;

export const categories = [
  { name: "Rent",           value: 650, color: "#7c52c8", budget: 700 },
  { name: "Groceries",      value: 280, color: "#3bafc8", budget: 300 },
  { name: "Dining Out",     value: 140, color: "#b5155e", budget: 100 },
  { name: "Transport",      value: 95,  color: "#5564c0", budget: 100 },
  { name: "Entertainment",  value: 120, color: "#a040a0", budget: 80  },
  { name: "Utilities",      value: 85,  color: "#2e86ab", budget: 100 },
  { name: "Subscriptions",  value: 45,  color: "#8b3a8b", budget: 50  },
  { name: "Health",         value: 60,  color: "#0e7c6e", budget: 75  },
  { name: "Clothing",       value: 95,  color: "#6a43b5", budget: 75  },
  { name: "Other",          value: 110, color: "#4a7cb5", budget: 100 },
];

export const incomeCategories = [
  { name: "Part-time Job",   value: 1200, color: "#7c52c8" },
  { name: "Financial Aid",   value: 600,  color: "#3bafc8" },
  { name: "Family Support",  value: 300,  color: "#5564c0" },
  { name: "Freelance",       value: 100,  color: "#a040a0" },
];

export const paycheckSplit = [
  { category: "Rent", percent: 30 },
  { category: "Groceries", percent: 15 },
  { category: "Savings", percent: 20 },
  { category: "Entertainment", percent: 10 },
  { category: "Transport", percent: 5 },
  { category: "Other", percent: 20 },
];

export const monthlyRollover = [
  { month: "Sep", income: 1900, expenses: 1850, savings: 50 },
  { month: "Oct", income: 2000, expenses: 1700, savings: 300 },
  { month: "Nov", income: 2100, expenses: 1950, savings: 150 },
  { month: "Dec", income: 2400, expenses: 2300, savings: 100 },
  { month: "Jan", income: 2200, expenses: 1600, savings: 600 },
  { month: "Feb", income: 2200, expenses: 1680, savings: 520 },
];

export const transactions = [
  { id: 1, date: "2025-02-20", description: "Wegmans Grocery", category: "Groceries", amount: -67.42, type: "expense" },
  { id: 2, date: "2025-02-20", description: "Part-time Job Paycheck", category: "Job", amount: 600.00, type: "income" },
  { id: 3, date: "2025-02-18", description: "Netflix", category: "Subscriptions", amount: -15.99, type: "expense" },
  { id: 4, date: "2025-02-17", description: "Chipotle", category: "Dining Out", amount: -13.75, type: "expense" },
  { id: 5, date: "2025-02-16", description: "NFTA Bus Pass", category: "Transport", amount: -50.00, type: "expense" },
  { id: 6, date: "2025-02-15", description: "Freelance Design Project", category: "Freelance", amount: 100.00, type: "income" },
  { id: 7, date: "2025-02-14", description: "CVS Pharmacy", category: "Health", amount: -24.99, type: "expense" },
  { id: 8, date: "2025-02-12", description: "February Rent", category: "Rent", amount: -650.00, type: "expense" },
  { id: 9, date: "2025-02-10", description: "Spotify Premium", category: "Subscriptions", amount: -10.99, type: "expense" },
  { id: 10, date: "2025-02-08", description: "Target", category: "Clothing", amount: -45.23, type: "expense" },
  { id: 11, date: "2025-02-07", description: "Financial Aid Disbursement", category: "Financial Aid", amount: 600.00, type: "income" },
  { id: 12, date: "2025-02-05", description: "Planet Fitness", category: "Health", amount: -25.00, type: "expense" },
  { id: 13, date: "2025-02-03", description: "Amazon Prime", category: "Subscriptions", amount: -14.99, type: "expense" },
  { id: 14, date: "2025-02-01", description: "Electric Bill", category: "Utilities", amount: -85.00, type: "expense" },
];

export const savingsGoals = [
  { id: 1, name: "Emergency Fund",          target: 1000, current: 640,  color: "#7c52c8", icon: "🛡️", deadline: "May 2025" },
  { id: 2, name: "Spring Break Trip",        target: 800,  current: 320,  color: "#3bafc8", icon: "✈️", deadline: "Mar 2025" },
  { id: 3, name: "New Laptop",               target: 1200, current: 480,  color: "#b5155e", icon: "💻", deadline: "Aug 2025" },
  { id: 4, name: "Textbooks Next Semester",  target: 400,  current: 400,  color: "#0e7c6e", icon: "📚", deadline: "Aug 2025" },
];

export const savingsPlan = [
  { month: "Mar", projected: 520, cumulative: 1160 },
  { month: "Apr", projected: 520, cumulative: 1680 },
  { month: "May", projected: 520, cumulative: 2200 },
  { month: "Jun", projected: 600, cumulative: 2800 },
  { month: "Jul", projected: 600, cumulative: 3400 },
  { month: "Aug", projected: 600, cumulative: 4000 },
];