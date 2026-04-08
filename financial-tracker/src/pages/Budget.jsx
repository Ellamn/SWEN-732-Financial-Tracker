import { useState, useEffect, useCallback } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useUser } from "../context/UserContext";
import { getExpenseCategoriesByOwner, deleteExpenseCategory } from "../api";

const SPLIT_COLORS = ["#7c52c8", "#3bafc8", "#b5155e", "#5564c0", "#a040a0", "#0e7c6e"];
const CAT_COLORS = ["#7c52c8", "#3bafc8", "#b5155e", "#5564c0", "#a040a0", "#0e7c6e", "#e07b39", "#2a7abf"];

const DEFAULT_SPLITS = [
  {category: "Needs", percent: 50 },
  {category: "Wants", percent: 20 },
  {category: "Savings", percent: 20 },
  {category: "Education", percent: 5  },
  {category: "Emergency", percent: 5  },
];
const DEFAULT_CATS = ["Groceries", "Rent", "Transport", "Entertainment", "Utilities"];

function loadBudgetAmounts(userId){ try { return JSON.parse(localStorage.getItem("budgetAmounts_" + userId)) || {}; } catch { return {}; } }
function saveBudgetAmounts(userId, amts){ localStorage.setItem("budgetAmounts_" + userId, JSON.stringify(amts)); }
function loadSplits(userId){ try { return JSON.parse(localStorage.getItem("splits_" + userId)) || null; }    catch { return null; } }
function saveSplits(userId, s){ localStorage.setItem("splits_" + userId, JSON.stringify(s)); }
function loadPaycheck(userId){ return parseFloat(localStorage.getItem("paycheck_" + userId) || "600"); }
function savePaycheck(userId, v){ localStorage.setItem("paycheck_" + userId, String(v)); }

export default function Budget() {
  const {userId} = useUser();

  const [paycheck, setPaycheck] = useState(() => loadPaycheck(userId));
  const [splits, setSplits] = useState(() => loadSplits(userId) || DEFAULT_SPLITS);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newCat, setNewCat] = useState("");
  const [addingCat, setAddingCat] = useState(false);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getExpenseCategoriesByOwner(userId);
      const amts = loadBudgetAmounts(userId);

      if (data.length === 0) {
        await seedDefaults();
      } else {
        const rows = data.map((cat, i) => ({
          id: cat.category_id,
          name: cat.name,
          budget: amts[cat.category_id]?.budget ?? 200,
          value: amts[cat.category_id]?.value  ?? 0,
          color: CAT_COLORS[i % CAT_COLORS.length],
        }));
        setBudgets(rows);
        setLoading(false);
      }
    } catch {
      setError("Failed to load categories. Check if the Flask API is running");
      setLoading(false);
    }
  }, [userId]);

  const seedDefaults = async () => {
    const results = await Promise.allSettled(
      DEFAULT_CATS.map(name =>
        fetch("http://localhost:5000/expenses/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ owner: userId, name }),
        }).then(r => r.ok ? r.json() : null)
      )
    );
    const rows = results.map((r, i) => {
      const id = r.status === "fulfilled" && r.value ? r.value.category_id : "local_" + i;
      return { id, name: DEFAULT_CATS[i], budget: 200, value: 0, color: CAT_COLORS[i % CAT_COLORS.length] };
    });
    setBudgets(rows);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  useEffect(() => {
    if (budgets.length === 0) return;
    const amts = {};
    budgets.forEach(c => { amts[c.id] = { budget: c.budget, value: c.value }; });
    saveBudgetAmounts(userId, amts);
  }, [budgets, userId]);

  useEffect(() => {saveSplits(userId, splits);}, [splits, userId]);
  useEffect(() => {savePaycheck(userId, paycheck);}, [paycheck, userId]);

  const addCategory = async () => {
    if (!newCat.trim()) return;
    setAddingCat(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/expenses/", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ owner: userId, name: newCat.trim() }),
      });
      if (!res.ok) throw new Error(res.status);
      const created = await res.json();
      const newRow = {
        id: created.category_id,
        name: newCat.trim(),
        budget: 200,
        value: 0,
        color: CAT_COLORS[budgets.length % CAT_COLORS.length],
      };
      setBudgets(prev => [...prev, newRow]);
      setNewCat("");
    } catch (e) {
      setError("Failed to add category.");
      console.error(e);
    }
    setAddingCat(false);
  };

  const deleteCategory = async (id) => {
    try {
      await deleteExpenseCategory(id);
      setBudgets(prev => prev.filter(c => c.id !== id));
    } catch {
      setError("Failed to delete category.");
    }
  };

  const updateSplit = (i, val) => setSplits(prev => {const n = [...prev]; n[i] = {...n[i], percent: Math.max(0, Math.min(100, parseInt(val) || 0))}; return n;});
  const updateBudget = (i, val) => setBudgets(prev => {const n = [...prev]; n[i] = {...n[i], budget: parseFloat(val) || 0}; return n;});
  const updateSpent = (i, val) => setBudgets(prev => {const n = [...prev]; n[i] = {...n[i], value: parseFloat(val) || 0}; return n;});

  const totalPercent = splits.reduce((a, s) => a + s.percent, 0);
  const pieData = splits.map((s, i) => ({name: s.category, value: s.percent, color: SPLIT_COLORS[i % SPLIT_COLORS.length]}));

  return (
    <div>
      <div className="page-header">
        <h1>Budget</h1>
        <p>Split your paycheck, set spending limits, and track budget usage</p>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="section-title">Paycheck Splitter</div>
          <div className="form-group">
            <label>Paycheck Amount ($)</label>
            <input type="number" value={paycheck}
              onChange={e => setPaycheck(parseFloat(e.target.value) || 0)} />
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 20 }}>
            <ResponsiveContainer width={160} height={160}>
              <PieChart>
                <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3}>
                  {pieData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val, name) => [val + "% - $" + ((val / 100) * paycheck).toFixed(2), name]} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: totalPercent === 100 ? "var(--accent)" : "var(--danger)", fontWeight: 700, marginBottom: 12, fontFamily: "'DM Mono', monospace" }}>
                {totalPercent}% allocated {totalPercent !== 100 && ("(" + (totalPercent > 100 ? "over" : "under") + " by " + Math.abs(100 - totalPercent) + "%)")}
              </div>
              {splits.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: SPLIT_COLORS[i % SPLIT_COLORS.length], flexShrink: 0 }} />
                  <span style={{ fontSize: 12, flex: 1, color: "var(--text-sub)" }}>{s.category}</span>
                  <input type="number" value={s.percent} onChange={e => updateSplit(i, e.target.value)}
                    style={{ width: 52, padding: "3px 8px", fontSize: 12, textAlign: "right" }} min="0" max="100" />
                  <span style={{ fontSize: 11, color: "var(--text-muted)", width: 60, textAlign: "right", fontFamily: "'DM Mono', monospace" }}>
                    ${((s.percent / 100) * paycheck).toFixed(0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-title">Monthly Budget Limits</div>
          {loading ? (
            <div style={{ color: "var(--text-muted)", fontSize: 13 }}>Loading categories ...</div>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, maxHeight: 320, overflowY: "auto", marginBottom: 16 }}>
                {budgets.map((c, i) => {
                  const pct  = c.budget > 0 ? Math.min((c.value / c.budget) * 100, 100) : 0;
                  const over = c.value > c.budget;
                  return (
                    <div key={c.id}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color }} />
                          <span style={{ fontSize: 13 }}>{c.name}</span>
                          {over && <span className="tag tag-red" style={{ fontSize: 9 }}>over</span>}
                        </div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <span style={{ fontSize: 10, color: "var(--text-muted)" }}>spent</span>
                          <input type="number" value={c.value} onChange={e => updateSpent(i, e.target.value)}
                            style={{ width: 60, padding: "2px 6px", fontSize: 12, textAlign: "right" }} />
                          <span style={{ color: "var(--text-muted)", fontSize: 11 }}>/</span>
                          <input type="number" value={c.budget} onChange={e => updateBudget(i, e.target.value)}
                            style={{ width: 60, padding: "2px 6px", fontSize: 12, textAlign: "right" }} />
                          <button onClick={() => deleteCategory(c.id)}
                            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 12 }}>✕</button>
                        </div>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{
                          width: pct + "%",
                          background: over ? "var(--danger)" : pct > 80 ? "var(--accent4)" : c.color,
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <input placeholder="New category name..." value={newCat}
                  onChange={e => setNewCat(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && addCategory()}
                  style={{ flex: 1, fontSize: 12, padding: "6px 10px" }} />
                <button className="btn btn-ghost" style={{ fontSize: 12 }}
                  onClick={addCategory} disabled={addingCat}>
                  {addingCat ? "..." : "+ Add"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="card">
        <div className="section-title">Budget Summary</div>
        <div className="grid-4">
          {[
            {label: "Total Budgeted", value: "$" + budgets.reduce((a, c) => a + c.budget, 0).toFixed(0), color: "var(--text)"},
            {label: "Total Spent", value: "$" + budgets.reduce((a, c) => a + c.value,  0).toFixed(0), color: "var(--danger)"},
            {label: "Remaining", value: "$" + budgets.reduce((a, c) => a + c.budget - c.value, 0).toFixed(0), color: "var(--accent)"},
            {label: "Over-budget Categories", value: budgets.filter(c => c.value > c.budget).length, color: "var(--accent4)"},
          ].map((s, i) => (
            <div key={i} className="card-sm">
              <div className="stat-label">{s.label}</div>
              <div className="stat-value mono" style={{ color: s.color, fontSize: "1.3rem"}}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}