import "./Dashboard.css";
import { useState, useEffect, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";
import { useUser } from "../context/UserContext";
import { getBalancesByOwner } from "../api";

import warningIcon from "../assets/warning.svg";
import editIcon from "../assets/edit.svg";
import incomeIcon from "../assets/income.svg";
import expenseIcon from "../assets/expense.svg";
import savingsIcon from "../assets/savings.svg";
import rateIcon from "../assets/rate.svg";

const CAT_COLORS  = ["#7c52c8","#3bafc8","#b5155e","#5564c0","#a040a0","#0e7c6e","#e07b39","#2a7abf"];
const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function loadBalance(userId){ return parseFloat(localStorage.getItem(`balance_${userId}`) || "0"); }
function saveBalance(userId, val){ localStorage.setItem(`balance_${userId}`, String(val)); }

function loadBudgetRows(userId) {
  try { return JSON.parse(localStorage.getItem("budgetAmounts_" + userId)) || {}; }
  catch { return {}; }
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <div className="tooltip-title">{payload[0].name}</div>
        <div className="tooltip-value" style={{ color: payload[0].payload.color || "#7c52c8"}}>
          ${payload[0].value.toFixed(2)}
        </div>
      </div>
    );
  }
  return null;
};

function StatCard({ icon, label, value, sub, color, bg }) {
  return (
    <div className="card stat-card" style={{ background: bg }}>
      <div className="stat-header">
        <img src={icon} className="stat-icon" alt="" />
        <div className="stat-label">{label}</div>
      </div>
      <div className="stat-value stat-value-large" style={{color}}>{value}</div>
      <div className="stat-sub">{sub}</div>
    </div>
  );
}

function PieSection({ title, data }) {
  return (
    <div className="card">
      <div className="section-title">{title}</div>
      <div className="chart-flex">
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie data={data} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3}>
              {data.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="chart-legend">
          {data.map((c, i) => (
            <div key={i} className="legend-item">
              <div className="legend-color" style={{ background: c.color }} />
              <span className="legend-label">{c.name}</span>
              <span className="mono legend-value">${c.value.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { userId } = useUser();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(() => loadBalance(userId));
  const [editingBalance, setEditingBalance] = useState(false);
  const [tempBalance, setTempBalance] = useState(balance);

  const fetchTx = useCallback(async () => {
    setLoading(true);
    try {
      const events = await getBalancesByOwner(userId);
      const loaded = events.map(ev => ({
        id: ev.event_id,
        name: ev.name,
        amount: ev.amount / 100,
        date: ev.date,
        category: "Other",
        type: ev.amount >= 0 ? "income" : "expense",
      }));
      setTransactions(loaded);
    } catch {
      
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchTx(); }, [fetchTx]);
 
  const now = new Date();
  const curMonth = now.getMonth();
  const curYear = now.getFullYear();

  const thisMonth = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === curMonth && d.getFullYear() === curYear;
  });

  const monthlyIncome = thisMonth.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const monthlyExpenses = Math.abs(thisMonth.filter(t => t.amount < 0).reduce((a, t) => a + t.amount, 0));
  const netSavings = monthlyIncome - monthlyExpenses;
  const savingsRate = monthlyIncome > 0 ? Math.round((netSavings / monthlyIncome) * 100) : 0;

  const budgetAmts = loadBudgetRows(userId);
  const overBudget = Object.entries(budgetAmts).filter(([, { value, budget }]) => value > budget).map(([id, { value, budget }]) => ({ id, value, budget }));
  const incomeTotal = thisMonth.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0);
  const expenseTotal = Math.abs(thisMonth.filter(t => t.amount < 0).reduce((a, t) => a + t.amount, 0));
  const incomePieData = incomeTotal  > 0 ? [{ name: "Income", value: incomeTotal,  color: "#3bafc8" }] : [];
  const expPieData = expenseTotal > 0 ? [{ name: "Expenses", value: expenseTotal, color: "#b5155e" }] : [];

  // monthly rollover for the last six months 
  const monthlyRollover = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(curYear, curMonth - 5 + i, 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const mTx = transactions.filter(t => {
      const td = new Date(t.date);
      return td.getMonth() === m && td.getFullYear() === y;
    });
    const income = mTx.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0);
    const expenses = Math.abs(mTx.filter(t => t.amount < 0).reduce((a, t) => a + t.amount, 0));
    return { month: MONTH_NAMES[m], income: Math.round(income), expenses: Math.round(expenses), savings: Math.round(income - expenses) };
  });

  const monthLabel = `${MONTH_NAMES[curMonth]} ${curYear}`;

  return (
    <div>
      <div className="page-header dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Your financial snapshot - {monthLabel}</p>
        </div>
      </div>

      <div className="card balance-card">
        <div>
          <div className="stat-label">Current Bank Balance</div>
          {editingBalance ? (
            <div className="balance-edit">
              <span className="balance-dollar">$</span>
              <input className="balance-input" type="number" value={tempBalance}
                onChange={e => setTempBalance(e.target.value)} />
              <button className="btn btn-primary" onClick={() => {
                const v = parseFloat(tempBalance);
                setBalance(v);
                saveBalance(userId, v);
                setEditingBalance(false);
              }}>Save</button>
              <button className="btn btn-ghost" onClick={() => setEditingBalance(false)}>Cancel</button>
            </div>
          ) : (
            <div className="stat-value mono balance-value">
              ${parseFloat(balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </div>
          )}
        </div>
        {!editingBalance && (
          <button className="btn btn-ghost balance-update-btn" onClick={() => { setTempBalance(balance); setEditingBalance(true); }}>
            <img src={editIcon} className="btn-icon" alt="" />
            Update Balance
          </button>
        )}
      </div>

      {overBudget.length > 0 && (
        <div className="alert alert-danger dashboard-alert">
          <img src={warningIcon} className="alert-icon" alt="Warning" />
          <div>
            <strong>Over budget this month:</strong>{" "}
            {overBudget.map(c => `$${c.value} spent / $${c.budget} limit`).join(" · ")}
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: "var(--text-muted)", marginBottom: 24 }}>Loading transactions…</div>
      ) : (
        <>
          <div className="grid-4 stats-grid">
            <StatCard icon={incomeIcon} label="Monthly Income" value={`$${monthlyIncome.toLocaleString("en-US",{maximumFractionDigits:0})}`} sub="This month" color="var(--success)" bg="var(--success-fill)"/>
            <StatCard icon={expenseIcon} label="Monthly Expenses" value={`$${monthlyExpenses.toLocaleString("en-US",{maximumFractionDigits:0})}`} sub="This month" color="var(--danger)" bg="var(--danger-fill)"/>
            <StatCard icon={savingsIcon} label="Net Savings" value={`$${netSavings.toLocaleString("en-US",{maximumFractionDigits:0})}`} sub="This month" color="var(--accent)" bg="var(--surface2)"/>
            <StatCard icon={rateIcon} label="Savings Rate" value={`${savingsRate}%`} sub="Of income saved" color="var(--accent4)" bg="#eef0fb"/>
          </div>

          {(expPieData.length > 0 || incomePieData.length > 0) && (
            <div className="grid-2 chart-row">
              {expPieData.length > 0
                ? <PieSection title="Spending this Month" data={expPieData} />
                : <div className="card" style={{ display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text-muted)",fontSize:13 }}>No expenses this month</div>
              }
              {incomePieData.length > 0
                ? <PieSection title="Income this Month" data={incomePieData} />
                : <div className="card" style={{ display:"flex",alignItems:"center",justifyContent:"center",color:"var(--text-muted)",fontSize:13 }}>No income logged this month</div>
              }
            </div>
          )}

          <div className="card">
            <div className="section-title">Monthly Rollover - Income vs. Expenses</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyRollover} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(183,149,228,0.08)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#6b5c8a", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#6b5c8a", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                <Tooltip content={({ active, payload, label }) => active && payload ? (
                  <div className="chart-tooltip">
                    <div className="bar-tooltip-title">{label}</div>
                    {payload.map((p, i) => (
                      <div key={i} className="tooltip-value" style={{ color: p.fill }}>{p.name}: ${p.value}</div>
                    ))}
                  </div>
                ) : null} />
                <Bar dataKey="income" name="Income" fill="#3bafc8" radius={[4,4,0,0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#b5155e" radius={[4,4,0,0]} />
                <Bar dataKey="savings" name="Savings" fill="#7c52c8" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
}