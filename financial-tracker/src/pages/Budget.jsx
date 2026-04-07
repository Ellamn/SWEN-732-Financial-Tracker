import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { categories, paycheckSplit } from "../data/fakeData";

export default function Budget() {
  {/*TODO: cannot hardcode "paycheckSplit" or "categories" */}
  const [paycheck, setPaycheck] = useState(600);
  const [splits, setSplits] = useState(paycheckSplit);
  const [budgets, setBudgets] = useState(categories.map(c => ({ ...c })));

  const totalPercent = splits.reduce((a, s) => a + s.percent, 0);
  const splitColors = ["#7c52c8", "#3bafc8", "#b5155e", "#5564c0", "#a040a0", "#0e7c6e"];

  const updateSplit = (i, val) => {
    const next = [...splits];
    next[i] = { ...next[i], percent: Math.max(0, Math.min(100, parseInt(val) || 0)) };
    setSplits(next);
  };

  const updateBudget = (i, val) => {
    const next = [...budgets];
    next[i] = { ...next[i], budget: parseFloat(val) || 0 };
    setBudgets(next);
  };

  const pieData = splits.map((s, i) => ({ name: s.category, value: s.percent, color: splitColors[i % splitColors.length] }));

  return (
    <div>
      {/*Budget header */}
      {/*TODO: "Budget title is being cutoff slightly*/}
      <div className="page-header">
        <h1>Budget</h1>
        <p>Split your paycheck, set spending limits, track budget usage</p>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* "paycheck splitter" card */}
        <div className="card">
          <div className="section-title">Paycheck Splitter</div>
          <div className="form-group">
            <label>Paycheck Amount ($)</label>
            <input type="number" value={paycheck} onChange={e => setPaycheck(parseFloat(e.target.value) || 0)} />
          </div>

          <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20 }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                  {pieData.map((c, i) => <Cell key={i} fill={c.color} />)}
                </Pie>
                <Tooltip formatter={(val, name) => [`${val}% — $${((val / 100) * paycheck).toFixed(2)}`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 11, color: totalPercent === 100 ? "var(--accent)" : "var(--danger)",
                fontWeight: 700, marginBottom: 12, fontFamily: "'DM Mono', monospace"
              }}>
                {totalPercent}% allocated {totalPercent !== 100 && `(${totalPercent > 100 ? "over" : "under"} by ${Math.abs(100 - totalPercent)}%)`}
              </div>
              {splits.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: splitColors[i % splitColors.length], flexShrink: 0 }} />
                  <span style={{ fontSize: 12, flex: 1, color: "var(--text-sub)" }}>{s.category}</span>
                  <input
                    type="number"
                    value={s.percent}
                    onChange={e => updateSplit(i, e.target.value)}
                    style={{ width: 52, padding: "3px 8px", fontSize: 12, textAlign: "right" }}
                    min="0" max="100"
                  />
                  <span style={{ fontSize: 11, color: "var(--text-muted)", width: 60, textAlign: "right", fontFamily: "'DM Mono', monospace" }}>
                    ${((s.percent / 100) * paycheck).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* "monthly budget limits" card */}
        <div className="card">
          <div className="section-title">Monthly Budget Limits</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: 400, overflowY: "auto" }}>
            {budgets.map((c, i) => {
              const pct = Math.min((c.value / c.budget) * 100, 100);
              const over = c.value > c.budget;
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} />
                      <span style={{ fontSize: 13 }}>{c.name}</span>
                      {over && <span className="tag tag-red" style={{ fontSize: 9 }}>over</span>}
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span className="mono" style={{ fontSize: 12, color: over ? "var(--danger)" : "var(--text-sub)" }}>${c.value}</span>
                      <span style={{ color: "var(--text-muted)", fontSize: 11 }}>/</span>
                      <input
                        type="number"
                        value={c.budget}
                        onChange={e => updateBudget(i, e.target.value)}
                        style={{ width: 68, padding: "2px 8px", fontSize: 12, textAlign: "right" }}
                      />
                    </div>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{
                      width: `${pct}%`,
                      background: over ? "var(--danger)" : pct > 80 ? "var(--accent4)" : c.color
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* "budget summary" card */}
      <div className="card">
        <div className="section-title">Budget Summary</div>
        <div className="grid-4">
          {[
            { label: "Total Budgeted", value: `$${budgets.reduce((a, c) => a + c.budget, 0)}`, color: "var(--text)" },
            { label: "Total Spent", value: `$${budgets.reduce((a, c) => a + c.value, 0)}`, color: "var(--danger)" },
            { label: "Remaining", value: `$${budgets.reduce((a, c) => a + c.budget - c.value, 0)}`, color: "var(--accent)" },
            { label: "Over-budget Categories", value: budgets.filter(c => c.value > c.budget).length, color: "var(--accent4)" },
          ].map((s, i) => (
            <div key={i} className="card-sm">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value mono" style={{ color: s.color, fontSize: "1.3rem" }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}