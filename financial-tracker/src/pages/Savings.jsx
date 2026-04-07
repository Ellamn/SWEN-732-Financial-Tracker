import { useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { savingsPlan, monthlyRollover } from "../data/fakeData";

function buildProjection(currentSavings, monthlyContrib, months, growthRate) {
  const result = [];
  let cumulative = currentSavings;
  const monthNames = ["Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb"];
  for (let i = 0; i < months; i++) {
    cumulative += monthlyContrib * (1 + growthRate / 100);
    result.push({
      month: monthNames[i % 12],
      projected: Math.round(monthlyContrib),
      cumulative: Math.round(cumulative),
    });
  }
  return result;
}

export default function Savings() {
  const [currentSaved, setCurrentSaved] = useState(640);
  const [monthlyContrib, setMonthlyContrib] = useState(520);
  const [months, setMonths] = useState(6);
  const [interest, setInterest] = useState(0.5);
  const [goalTarget, setGoalTarget] = useState(5000);

  const data = buildProjection(currentSaved, monthlyContrib, months, interest);
  const finalAmount = data.length > 0 ? data[data.length - 1].cumulative : currentSaved;
  const monthsToGoal = (() => {
    let c = currentSaved;
    let m = 0;
    while (c < goalTarget && m < 120) { c += monthlyContrib; m++; }
    return c >= goalTarget ? m : null;
  })();

  const rolloverCumulative = (() => {
    let c = 0;
    return monthlyRollover.map(r => { c += r.savings; return { ...r, cumulative: c }; });
  })();

  return (
    <div>
      <div className="page-header">
        <h1>Savings Plan</h1>
        <p>Project your future savings and plan your financial path</p>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        {/* Controls */}
        <div className="card">
          <div className="section-title">Projection Settings</div>
          <div className="form-group">
            <label>Current Savings ($)</label>
            <input type="number" value={currentSaved} onChange={e => setCurrentSaved(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="form-group">
            <label>Monthly Contribution ($)</label>
            <input type="number" value={monthlyContrib} onChange={e => setMonthlyContrib(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="form-group">
            <label>Projection Length (months)</label>
            <input type="range" min="1" max="24" value={months} onChange={e => setMonths(parseInt(e.target.value))}
              style={{ background: "var(--surface3)", borderRadius: 8, border: "none", height: 6, cursor: "pointer", padding: 0, appearance: "none" }} />
            <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>{months} months</div>
          </div>
          <div className="form-group">
            <label>Monthly Interest Rate (%)</label>
            <input type="number" step="0.1" value={interest} onChange={e => setInterest(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="form-group">
            <label>Savings Goal ($)</label>
            <input type="number" value={goalTarget} onChange={e => setGoalTarget(parseFloat(e.target.value) || 0)} />
          </div>
        </div>

        {/* Summary */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Projected Balance", value: `$${finalAmount.toLocaleString()}`, color: "var(--accent)", sub: `In ${months} months` },
            { label: "Total Contributed", value: `$${(monthlyContrib * months).toLocaleString()}`, color: "var(--accent4)", sub: "From monthly savings" },
            { label: "Interest Earned", value: `$${(finalAmount - currentSaved - monthlyContrib * months).toFixed(0)}`, color: "var(--accent2)", sub: `At ${interest}%/mo` },
            { label: "Months to Goal", value: monthsToGoal !== null ? `${monthsToGoal} months` : "Increase savings", color: monthsToGoal !== null ? "var(--accent5)" : "var(--danger)", sub: `Target: $${goalTarget.toLocaleString()}` },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: 18 }}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value mono" style={{ color: s.color, fontSize: "1.4rem" }}>{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Projection Chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-title">Savings Projection</div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c52c8" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#7c52c8" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(183,149,228,0.15)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#6b5c8a", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b5c8a", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v.toLocaleString()}`} />
            <Tooltip
              formatter={(val) => [`$${val.toLocaleString()}`, "Cumulative Savings"]}
              contentStyle={{ background: "white", border: "1px solid rgba(183,149,228,0.3)", borderRadius: 10, boxShadow: "0 4px 16px rgba(124,82,200,0.12)" }}
              labelStyle={{ color: "#2d1f4e", fontWeight: 600 }}
            />
            {goalTarget > 0 && (
              <ReferenceLine y={goalTarget} stroke="#8a5700" strokeDasharray="5 5" label={{ value: "Goal", fill: "#8a5700", fontSize: 11 }} />
            )}
            <Area type="monotone" dataKey="cumulative" stroke="#7c52c8" strokeWidth={2.5} fill="url(#savingsGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Historical Rollover */}
      <div className="card">
        <div className="section-title">Historical Savings Rollover</div>
        <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
          {rolloverCumulative.map((m, i) => (
            <div key={i} className="card-sm" style={{ minWidth: 130, flexShrink: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>{m.month}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: "var(--text-muted)" }}>Saved</span>
                  <span className="mono" style={{ color: m.savings >= 0 ? "var(--accent)" : "var(--danger)" }}>
                    {m.savings >= 0 ? "+" : ""}${m.savings}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                  <span style={{ color: "var(--text-muted)" }}>Total</span>
                  <span className="mono" style={{ color: "var(--text)" }}>${m.cumulative}</span>
                </div>
              </div>
              <div className="progress-track" style={{ marginTop: 10, height: 4 }}>
                <div className="progress-fill" style={{ width: `${Math.min((m.cumulative / 2000) * 100, 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}