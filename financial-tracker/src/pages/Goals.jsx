import { useState } from "react";
import { savingsGoals as initialGoals } from "../data/fakeData";

export default function Goals() {
  {/*TODO: cannot hardcode inital goals */}
  const [goals, setGoals] = useState(initialGoals);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", target: "", current: "", icon: "🎯", deadline: "", color: "#7c52c8" });

  const addGoal = () => {
    if (!form.name || !form.target) return;
    setGoals([...goals, { id: Date.now(), ...form, target: parseFloat(form.target), current: parseFloat(form.current) || 0 }]);
    setShowAdd(false);
    setForm({ name: "", target: "", current: "", icon: "🎯", deadline: "", color: "#7c52c8" });
  };

  const deleteGoal = (id) => setGoals(goals.filter(g => g.id !== id));

  const updateContribution = (id, val) => {
    setGoals(goals.map(g => g.id === id
      ? { ...g, current: Math.min(g.target, g.current + parseFloat(val)) }
      : g
    ));
  };

  const COLORS = ["#7c52c8", "#3bafc8", "#b5155e", "#5564c0", "#a040a0", "#0e7c6e"];
  const ICONS = ["🎯", "🛡️", "✈️", "💻", "📚", "🎓", "🏠", "🚗", "💊", "🎸"];

  return (
    <div>
      {/*'savings goals' header */}
      {/*TODO: header text is cut off a bit */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>Savings Goals</h1>
          <p>Set targets, track progress, stay motivated</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>+ New Goal</button>
      </div>

      {/*'create new goal' section that shows up when "+New Goal" is clicked*/}
      {/**TODO: Icon button options are not in the middle of thier buttons */}
      {showAdd && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="section-title">Create New Goal</div>
          <div className="grid-2" style={{ gap: 16 }}>
            <div className="form-group">
              <label>Goal Name</label>
              <input placeholder="e.g. Emergency Fund" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Target Amount ($)</label>
              <input type="number" placeholder="1000" value={form.target} onChange={e => setForm({ ...form, target: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Already Saved ($)</label>
              <input type="number" placeholder="0" value={form.current} onChange={e => setForm({ ...form, current: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Deadline</label>
              <input type="month" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Icon</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {ICONS.map(ic => (
                  <button key={ic} onClick={() => setForm({ ...form, icon: ic })}
                    style={{ fontSize: 18, width: 36, height: 36, border: `2px solid ${form.icon === ic ? "var(--accent)" : "var(--border)"}`, borderRadius: 8, background: "var(--surface2)", cursor: "pointer" }}>
                    {ic}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Color</label>
              <div style={{ display: "flex", gap: 8 }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setForm({ ...form, color: c })}
                    style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: `3px solid ${form.color === c ? "white" : "transparent"}`, cursor: "pointer" }} />
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btn btn-primary" onClick={addGoal}>Create Goal</button>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* goals grid e.x. "emergyency fund", "new laptop", "sprint break trip", "textbooks next semester" */}
      {/*the way that money is contirbuted needs to change, and needs to be reflected in the account balance */}
      <div className="grid-2">
        {goals.map(g => {
          const pct = Math.min((g.current / g.target) * 100, 100);
          const done = g.current >= g.target;
          const remaining = g.target - g.current;
          return (
            <div key={g.id} className="card" style={{ borderColor: done ? `${g.color}40` : "var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, fontSize: 20,
                    background: `${g.color}20`, display: "flex", alignItems: "center", justifyContent: "center"
                  }}>{g.icon}</div>
                  <div>
                    <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>{g.name}</div>
                    {g.deadline && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>Due: {g.deadline}</div>}
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {done && <span className="tag tag-green">✓ Complete!</span>}
                  <button onClick={() => deleteGoal(g.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>✕</button>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: g.color, fontWeight: 500 }}>
                  ${g.current.toLocaleString()}
                </span>
                <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 13, color: "var(--text-muted)" }}>
                  ${g.target.toLocaleString()}
                </span>
              </div>
              <div className="progress-track" style={{ height: 10, marginBottom: 12 }}>
                <div className="progress-fill" style={{ width: `${pct}%`, background: g.color }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
                <span>{pct.toFixed(0)}% complete</span>
                <span>{done ? "Goal reached! 🎉" : `$${remaining.toFixed(0)} to go`}</span>
              </div>

              {!done && (
                <div style={{ display: "flex", gap: 8 }}>
                  {[10, 25, 50, 100].map(amt => (
                    <button key={amt} className="btn btn-ghost"
                      style={{ flex: 1, padding: "6px 0", fontSize: 11 }}
                      onClick={() => updateContribution(g.id, amt)}>
                      +${amt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {goals.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🎯</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16 }}>No goals yet</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Create your first savings goal to get started</div>
        </div>
      )}
    </div>
  );
}