import { useState, useEffect, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,} from "recharts";
import { useUser } from "../context/UserContext";
import { getBalancesByOwner } from "../api";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function loadSettings(userId) {
  try { return JSON.parse(localStorage.getItem("savingsSettings_" + userId)) || null; }
  catch { return null; }
}

function saveSettings(userId, s) {
  localStorage.setItem("savingsSettings_" + userId, JSON.stringify(s));
}

function buildProjection(currentSavings, monthlyContrib, months, growthRate) {
  const result = [];
  let cumulative = currentSavings;
  const now = new Date();
  for (let i = 0; i < months; i++) {
    cumulative += monthlyContrib * (1 + growthRate / 100);
    const d = new Date(now.getFullYear(), now.getMonth() + i + 1, 1);
    result.push({
      month: MONTH_NAMES[d.getMonth()],
      projected: Math.round(monthlyContrib),
      cumulative: Math.round(cumulative),
    });
  }
  return result;
}

export default function Savings() {
  const { userId } = useUser();
 
  const defaults = { currentSaved: 0, monthlyContrib: 0, months: 6, interest: 0.5, goalTarget: 5000 };
  const [settings, setSettings] = useState(() => loadSettings(userId) || defaults);

  const { currentSaved, monthlyContrib, months, interest, goalTarget } = settings;
  const set = (key, val) => setSettings(prev => ({ ...prev, [key]: val }));

  useEffect(() => { saveSettings(userId, settings); }, [settings, userId]);

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTx = useCallback(async () => {
    setLoading(true);
    try {
      const events = await getBalancesByOwner(userId);
      setTransactions(events.map(ev => ({ amount: ev.amount / 100, date: ev.date })));
    } catch {

    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchTx(); }, [fetchTx]);

  const now = new Date();
  const curMonth = now.getMonth();
  const curYear = now.getFullYear();

  const rolloverCumulative = (() => {
    let c = 0;
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(curYear, curMonth - 5 + i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const mTx = transactions.filter(t => {
        const td = new Date(t.date);
        return td.getMonth() === m && td.getFullYear() === y;
      });
      const inc = mTx.filter(t => t.amount > 0).reduce((a, t) => a + t.amount, 0);
      const exp = Math.abs(mTx.filter(t => t.amount < 0).reduce((a, t) => a + t.amount, 0));
      const savings = Math.round(inc - exp);
      c += savings;
      return { month: MONTH_NAMES[m], savings, cumulative: c };
    });
  })();

  const data = buildProjection(currentSaved, monthlyContrib, months, interest);
  const finalAmount = data.length > 0 ? data.at(-1).cumulative : currentSaved;

  const monthsToGoal = (() => {
    let c = currentSaved, m = 0;
    while (c < goalTarget && m < 120) { c += monthlyContrib; m++; }
    return c >= goalTarget ? m : null;
  })();

  return (
    <div>
      <div className="page-header">
        <h1>Savings Plan</h1>
        <p>Project your future savings and plan your financial path</p>
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="section-title">Projection Settings</div>
          <div className="form-group">
            <label htmlFor="currentSaved">Current Savings ($)</label>
            <input id="currentSaved" type="number" value={currentSaved}
              onChange={e => set("currentSaved", Number.parseFloat(e.target.value) || 0)} />
          </div>
          <div className="form-group">
            <label htmlFor="monthlyContrib">Monthly Contribution ($)</label>
            <input id="monthlyContrib" type="number" value={monthlyContrib}
              onChange={e => set("monthlyContrib", Number.parseFloat(e.target.value) || 0)} />
          </div>
          <div className="form-group">
            <label>Projection Length - {months} months</label>
            <input type="range" min="1" max="24" value={months}
              onChange={e => set("months", Number.parseInt(e.target.value))}
              style={{ background: "var(--surface3)", borderRadius: 8, border: "none", height: 6, cursor: "pointer", padding: 0, appearance: "none" }} />
          </div>
          <div className="form-group">
            <label htmlFor="interest">Monthly Interest Rate (%)</label>
            <input id="interest" type="number" step="0.1" value={interest}
              onChange={e => set("interest", Number.parseFloat(e.target.value) || 0)} />
          </div>
          <div className="form-group">
            <label htmlFor="goalTarget">Savings Goal ($)</label>
            <input id="goalTarget" type="number" value={goalTarget}
              onChange={e => set("goalTarget", Number.parseFloat(e.target.value) || 0)} />
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8, lineHeight: 1.5 }}>
            Enter your current savings balance and how much you plan to set aside each month.
            The chart below shows how your balance would grow over time at the given interest rate.
            The <strong>Historical Rollover</strong> section at the bottom is calculated from your
            actual logged transactions.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "Projected Balance", value: "$" + finalAmount.toLocaleString(), color: "var(--accent)",  sub: "In " + months + " months"},
            { label: "Total Contributed", value: "$" + (monthlyContrib * months).toLocaleString(), color: "var(--accent4)", sub: "From monthly savings"},
            { label: "Interest Earned", value: "$" + Math.max(0, finalAmount - currentSaved - monthlyContrib * months).toFixed(0), color: "var(--accent2)", sub: "At " + interest + "%/mo"},
            { label: "Months to Goal", value: monthsToGoal === null ? "Increase savings" : monthsToGoal + " months", color: monthsToGoal === null ? "var(--danger)" : "var(--accent5)", sub: "Target: $" + goalTarget.toLocaleString()},
          ].map((s) => (
            <div key={s.label} className="card" style={{ padding: 18 }}>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value mono" style={{ color: s.color, fontSize: "1.4rem" }}>{s.value}</div>
              <div className="stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-title">Savings Projection</div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#7c52c8" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#7c52c8" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(183,149,228,0.15)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#6b5c8a", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#6b5c8a", fontSize: 12 }} axisLine={false} tickLine={false}
              tickFormatter={v => "$" + v.toLocaleString()} />
            <Tooltip
              formatter={val => ["$" + val.toLocaleString(), "Cumulative Savings"]}
              contentStyle={{ background: "white", border: "1px solid rgba(183,149,228,0.3)", borderRadius: 10, boxShadow: "0 4px 16px rgba(124,82,200,0.12)" }}
              labelStyle={{ color: "#2d1f4e", fontWeight: 600 }}
            />
            {goalTarget > 0 && (
              <ReferenceLine y={goalTarget} stroke="#8a5700" strokeDasharray="5 5"
                label={{ value: "Goal", fill: "#8a5700", fontSize: 11 }} />
            )}
            <Area type="monotone" dataKey="cumulative" stroke="#7c52c8" strokeWidth={2.5}
              fill="url(#savingsGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <div className="section-title">Historical Savings Rollover</div>
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 12 }}>
          Net savings per month based on your logged transactions (income minus expenses).
        </p>
        {loading ? (
          <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading transactions...</div>
        ) : (
          <div style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8 }}>
            {rolloverCumulative.map((m, i) => (
              <div key={m.month + "-" + i} className="card-sm" style={{ minWidth: 130, flexShrink: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>{m.month}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                    <span style={{ color: "var(--text-muted)" }}>Saved</span>
                    <span className="mono" style={{ color: m.savings >= 0 ? "var(--accent)" : "var(--danger)" }}>
                      {m.savings >= 0 ? "+" : ""}${m.savings}
                    </span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                    <span style={{ color: "var(--text-muted)" }}>Running total</span>
                    <span className="mono" style={{ color: "var(--text)" }}>${m.cumulative}</span>
                  </div>
                </div>
                <div className="progress-track" style={{ marginTop: 10, height: 4 }}>
                  <div className="progress-fill" style={{
                    width: Math.min(goalTarget > 0 ? (m.cumulative / goalTarget) * 100 : 0, 100) + "%"
                  }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}