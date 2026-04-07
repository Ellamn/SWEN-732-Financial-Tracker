import "./Dashboard.css"; 

import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { accountBalance, categories, monthlyIncome, monthlyExpenses, monthlyRollover, incomeCategories } from "../data/fakeData";

{/* icons */}
import warningIcon from "../assets/warning.svg";
import editIcon from "../assets/edit.svg";
import incomeIcon from "../assets/income.svg";
import expenseIcon from "../assets/expense.svg";
import savingsIcon from "../assets/savings.svg";
import rateIcon from "../assets/rate.svg";

{/* tooltip for sections of the pie chart */}
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <div className="tooltip-title">
          {payload[0].name}
        </div>

        <div
          className="tooltip-value"
          style={{ color: payload[0].payload.color || "#7c52c8" }}
        >
          ${payload[0].value.toFixed(2)}
        </div>
      </div>
    );
  }
  return null;
};

{/* custom function for "Monthly Income", "Monthly Expenses", "Net Savings", and "Savings Rate" cards*/}
function StatCard({ icon, label, value, sub, color, bg }) {
  return (
    <div className="card stat-card" style={{ background: bg }}>
      <div className="stat-header">
        <img src={icon} className="stat-icon" alt="" />
        <div className="stat-label">{label}</div>
      </div>

      <div
        className="stat-value stat-value-large"
        style={{ color }}
      >
        {value}
      </div>

      <div className="stat-sub">{sub}</div>
    </div>
  );
};

{/* custom function for "Spending by Category" and "Income Sources" pie charts*/}
function PieSection({ title, data }) {
  return (
    <div className="card">
      {/*TODO: the bottom of this text is getting cut off*/}
      <div className="section-title">{title}</div>

      <div className="chart-flex" >
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
            >
              {data.map((c, i) => (
                <Cell key={i} fill={c.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="chart-legend">
          {data.map((c, i) => (
            <div key={i} className="legend-item">
              <div
                className="legend-color"
                style={{ background: c.color }}
              />
              <span className="legend-label">{c.name}</span>
              <span className="mono legend-value">
                ${c.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  {/* variables for React to use in display */}
  {/*TODO: accountBalance, categories, monthly income, monthly expenses, "month" cannot be hardcoded lol */}
  const [balance, setBalance] = useState(accountBalance);
  const [editingBalance, setEditingBalance] = useState(false);
  const [tempBalance, setTempBalance] = useState(accountBalance);
  const [dateRange, setDateRange] = useState("month");

  const overBudget = categories.filter(c => c.value > c.budget);
  const netSavings = monthlyIncome - monthlyExpenses;

  return (
    <div>
      {/* "Dashboard" page header */}
      {/*TODO:
          "financial snapshot" date cannot be hardcoded
          setDateRange(r) cannot hardcode to "month" in the useState()
      */}
      <div className="page-header dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Your financial snapshot - February 2026</p>
        </div>

        {/* <div className="dashboard-range-buttons">
          {["week", "month", "year"].map(r => (
            <button
              key={r}
              className={`btn range-btn ${dateRange === r ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setDateRange(r)}
            >{r}</button>
          ))}
        </div> */}

      </div>

      {/* "Current Bank Balance Box" */}
      {/*TODO:
          make the "TempBalance" not temporary
      */}
      <div className="card balance-card">
        <div>
          <div className="stat-label">Current Bank Balance</div>
          {editingBalance ? (
            <div className="balance-edit">
              <span className="balance-dollar">$</span>
              <input
                className="balance-input"
                type="number"
                value={tempBalance}
                onChange={e => setTempBalance(e.target.value)}
              />
              <button className="btn btn-primary" onClick={() => { setBalance(parseFloat(tempBalance)); setEditingBalance(false); }}>Save</button>
              <button className="btn btn-ghost" onClick={() => setEditingBalance(false)}>Cancel</button>
            </div>
          ) : (
            <div className="stat-value mono balance-value">
              ${parseFloat(balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          )}
        </div>
        {!editingBalance && (
          <button className="btn btn-ghost balance-update-btn" onClick={() => setEditingBalance(true)}>
            <>
              <img src={editIcon} className="btn-icon" alt="" />
              Update Balance
            </>
          </button>
        )}
      </div>

      {/* "over budget this month" box*/}
      {/*TODO:
          make the color of the warningIcon match the vibe
          "overBudget" cannot be calculated using hardcoded categories 
      */}
      {overBudget.length > 0 && (
        <div className="alert alert-danger dashboard-alert">
          <img
            src={warningIcon}
            className="alert-icon"
            alt="Warning"
          />
          <div>
            <strong>Over budget this month:</strong>{" "}
            {overBudget.map(c => `${c.name} ($${c.value} / $${c.budget} budget)`).join(" · ")}
          </div>
        </div>
      )}

      {/* "monthly income", "monthly expenses", "net savings", and "savings rate" boxes */}
      {/*TODO:
          make the color of the icons match their boxes
          icons don't totally match up with the title of the box
          "monthlyIncome" cannot be hardcoded
          "monthlyExpenses" cannot be hardcoded
          "netSavings" cannot be calculated using hardcoded values
      */}
      <div className="grid-4 stats-grid">
        <StatCard
          icon={incomeIcon}
          label="Monthly Income"
          value={`$${monthlyIncome.toLocaleString()}`}
          sub="This month"
          color="var(--success)"
          bg="var(--success-fill)"
        />

        <StatCard
          icon={expenseIcon}
          label="Monthly Expenses"
          value={`$${monthlyExpenses.toLocaleString()}`}
          sub="This month"
          color="var(--danger)"
          bg="var(--danger-fill)"
        />

        <StatCard
          icon={savingsIcon}
          label="Net Savings"
          value={`$${netSavings.toLocaleString()}`}
          sub="This month"
          color="var(--accent)"
          bg="var(--surface2)"
        />

        <StatCard
          icon={rateIcon}
          label="Savings Rate"
          value={`${Math.round((netSavings / monthlyIncome) * 100)}%`}
          sub="Of income saved"
          color="var(--accent4)"
          bg="#eef0fb"
        />
      </div>

      {/* "Spending by Category" and "Income Sources" charts */}
      {/*TODO: "catgeories" and "incomeCategories" cannot be hardcoded */}
      <div className="grid-2 chart-row">
        <PieSection
          title="Spending by Category"
          data={categories}
        />

        <PieSection
          title="Income Sources"
          data={incomeCategories}
        />
      </div>

      {/* "monthly rollover" chart*/}
      {/*TODO: "monthlyRollover" cannot be hardcoded */}
      <div className="card">
        <div className="section-title">Monthly Rollover — Income vs. Expenses</div>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={monthlyRollover} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(183,149,228,0.08)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#6b5c8a", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b5c8a", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip content={({ active, payload, label }) => active && payload ? (
              <div className="chart-tooltip">
                <div className="bar-tooltip-title">{label}</div>
                {payload.map((p, i) => (
                  <div
                    key={i}
                    className="tooltip-value"
                    style={{ color: p.fill }}
                  >
                    {p.name}: ${p.value}
                  </div>
                ))}
              </div>
            ) : null} />
            <Bar dataKey="income" name="Income" fill="#3bafc8" radius={[4,4,0,0]} />
            <Bar dataKey="expenses" name="Expenses" fill="#b5155e" radius={[4,4,0,0]} />
            <Bar dataKey="savings" name="Savings" fill="#7c52c8" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}