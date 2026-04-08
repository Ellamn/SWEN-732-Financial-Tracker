import { useState, useEffect, useCallback } from "react";
import { useUser } from "../context/UserContext";
import { getBudgetGoalsByOwner, deleteBudgetGoal } from "../api";

const COLORS = ["#7c52c8", "#3bafc8", "#b5155e", "#5564c0", "#a040a0", "#0e7c6e"];
const ICONS = ["\u{1F3AF}", "\u{1F6E1}\u{FE0F}", "\u{2708}\u{FE0F}", "\u{1F4BB}", "\u{1F4DA}", "\u{1F393}", "\u{1F3E0}", "\u{1F697}", "\u{1F48A}", "\u{1F3B8}"];

function loadUiMeta(userId){ try { return JSON.parse(localStorage.getItem("goalsMeta_" + userId)) || {}; } catch { return {}; }}
function saveUiMeta(userId, meta){ localStorage.setItem("goalsMeta_" + userId, JSON.stringify(meta));}

export default function Goals() {
  const { userId } = useUser();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "", target: "", current: "", icon: "\u{1F3AF}", deadline: "", color: "#7c52c8",
  });

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getBudgetGoalsByOwner(userId);
      const meta = loadUiMeta(userId);
      const loaded = data.map(g => ({
        id: g.goal_id,
        name: g.name,
        target: g.amount / 100,
        deadline: g.achieve_by_date,
        icon: meta[g.goal_id]?.icon || "\u{1F3AF}",
        color: meta[g.goal_id]?.color || "#7c52c8",
        current: meta[g.goal_id]?.current || 0,
      }));
      setGoals(loaded);
    } catch {
      setError("Failed to load goals. Check if the Flask API is running");
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addGoal = async () => {
    if (!form.name || !form.target) return;
    setSaving(true);
    setError("");
    try {
      const today = new Date().toISOString().slice(0, 10);
      const deadline = form.deadline || today;

      const res = await fetch("http://localhost:5000/goals/", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          owner: userId,
          name: form.name,
          amount: Math.round(parseFloat(form.target) * 100),
          achieve_by_date: deadline,
          started_on: today,
        }),
      });
      if (!res.ok) throw new Error("POST /goals/ returned " + res.status);

      const created = await res.json();
      const id = created.goal_id;

      const meta = loadUiMeta(userId);
      meta[id] = { icon: form.icon, color: form.color, current: parseFloat(form.current) || 0 };
      saveUiMeta(userId, meta);

      setGoals(prev => [...prev, {
        id,
        name: form.name,
        target: parseFloat(form.target),
        deadline: form.deadline,
        icon: form.icon,
        color: form.color,
        current: parseFloat(form.current) || 0,
      }]);
      setShowAdd(false);
      setForm({ name: "", target: "", current: "", icon: "\u{1F3AF}", deadline: "", color: "#7c52c8"});
    } catch (e) {
      setError("Failed to create goal. Check if the Flask API is running");
      console.error(e);
    }
    setSaving(false);
  };

  const deleteGoal = async (id) => {
    try {
      await deleteBudgetGoal(id);
      const meta = loadUiMeta(userId);
      delete meta[id];
      saveUiMeta(userId, meta);
      setGoals(prev => prev.filter(g => g.id !== id));
    } catch {
      setError("Failed to delete goal");
    }
  };

  const contribute = (id, amt) => {
    setGoals(prev => prev.map(g => {
      if (g.id !== id) return g;
      const next = Math.min(g.target, g.current + amt);
      const meta = loadUiMeta(userId);
      meta[id]   = { ...meta[id], current: next };
      saveUiMeta(userId, meta);
      return { ...g, current: next };
    }));
  };

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>Savings Goals</h1>
          <p>Set targets, track progress, stay motivated</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>+ New Goal</button>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}

      {showAdd && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="section-title">Create New Goal</div>
          <div className="grid-2" style={{ gap: 16 }}>
            <div className="form-group">
              <label>Goal Name</label>
              <input placeholder="e.g. Emergency Fund" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Target Amount ($)</label>
              <input type="number" placeholder="1000" value={form.target}
                onChange={e => setForm({ ...form, target: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Already Saved ($)</label>
              <input type="number" placeholder="0" value={form.current}
                onChange={e => setForm({ ...form, current: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Deadline (optional)</label>
              <input type="date" value={form.deadline}
                onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Icon</label>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {ICONS.map(ic => (
                  <button key={ic} onClick={() => setForm({ ...form, icon: ic })}
                    style={{
                      fontSize: 18, width: 36, height: 36,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "2px solid " + (form.icon === ic ? "var(--accent)" : "var(--border)"),
                      borderRadius: 8, background: "var(--surface2)", cursor: "pointer",
                    }}>{ic}</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label>Color</label>
              <div style={{ display: "flex", gap: 8 }}>
                {COLORS.map(c => (
                  <button key={c} onClick={() => setForm({ ...form, color: c })}
                    style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: "3px solid " + (form.color === c ? "white" : "transparent"), cursor: "pointer" }} />
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btn btn-primary" onClick={addGoal} disabled={saving}>
              {saving ? "Creating..." : "Create Goal"}
            </button>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>Loading goals...</div>
      ) : (
        <div className="grid-2">
          {goals.map(g => {
            const pct = g.target > 0 ? Math.min((g.current / g.target) * 100, 100) : 0;
            const done = g.current >= g.target;
            const remaining = g.target - g.current;
            return (
              <div key={g.id} className="card" style={{ borderColor: done ? g.color + "40" : "var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, fontSize: 20,
                      background: g.color + "20", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>{g.icon}</div>
                    <div>
                      <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 15 }}>{g.name}</div>
                      {g.deadline && (
                        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 2 }}>
                          Due: {g.deadline}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    {done && <span className="tag tag-green">Complete!</span>}
                    <button onClick={() => deleteGoal(g.id)}
                      style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>\u{2715}</button>
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
                  <div className="progress-fill" style={{ width: pct + "%", background: g.color }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)", marginBottom: 16 }}>
                  <span>{pct.toFixed(0)}% complete</span>
                  <span>{done ? "Goal reached!" : "$" + remaining.toFixed(0) + " to go"}</span>
                </div>

                {!done && (
                  <div style={{ display: "flex", gap: 8 }}>
                    {[10, 25, 50, 100].map(amt => (
                      <button key={amt} className="btn btn-ghost"
                        style={{ flex: 1, padding: "6px 0", fontSize: 11 }}
                        onClick={() => contribute(g.id, amt)}>
                        +${amt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!loading && goals.length === 0 && (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>{"\u{1F3AF}"}</div>
          <div style={{ fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16 }}>No goals yet</div>
          <div style={{ fontSize: 13, marginTop: 6 }}>Create your first savings goal to get started</div>
        </div>
      )}
    </div>
  );
}