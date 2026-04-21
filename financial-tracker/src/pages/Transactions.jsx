import { useState, useEffect, useCallback, useMemo } from "react";
import { useUser } from "../context/UserContext";
import {
  createBalanceEvent,
  deleteBalanceEvent,
  updateBalanceEvent,
  getBalancesByOwner,
  getExpenseCategoriesByOwner,
} from "../api";

const DEFAULT_CATEGORIES = [
  "Groceries", "Dining Out", "Rent", "Transport", "Entertainment",
  "Health", "Subscriptions", "Utilities", "Clothing", "Job",
  "Financial Aid", "Freelance", "Family", "Other",
];

export default function Transactions() {
  const { userId } = useUser();

  const [txList, setTxList] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter,setFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    description: "", 
    category: "Groceries", 
    amount: "", 
    type: "expense",
    date: new Date().toISOString().slice(0, 10),
  });

  const [editId,   setEditId]   = useState(null);
  const [editForm, setEditForm] = useState({});

  const nameToId = useMemo(() => {
    const m = {};
    for (const c of categories) {
      m[c.name.toLowerCase()] = c.category_id;
    }
    return m;
  }, [categories]);

  // Categories to show in the form dropdown. Prefer the user's real expense
  // categories (from the backend) and fall back to the default list so the page
  // still works before any categories exist.
  const categoryOptions = useMemo(() => {
    const names = categories.length > 0
      ? categories.map(c => c.name)
      : DEFAULT_CATEGORIES.filter(n => n !== "Other");
    return [...names, "Other"];
  }, [categories]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const events = await getBalancesByOwner(userId);
      const loaded = (events || []).map(ev => ({
        id: ev.event_id,
        description: ev.name,
        amount: ev.amount / 100,
        date: ev.date,
        // Note: the readable category name is resolved in a derived useMemo
        // below once categories have also loaded, so we just stash the id here.
        category: null,
        categoryId: ev.category_id || null,
        type: ev.amount >= 0 ? "income" : "expense",
      }));
      setTxList(loaded);
    } catch {
      setError("Failed to load transactions. Check that the Flask API is running");
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  useEffect(() => {
    let cancelled = false;
    if (!getExpenseCategoriesByOwner) return undefined;
    (async () => {
      try {
        const data = await getExpenseCategoriesByOwner(userId);
        if (!cancelled) setCategories(data || []);
      } catch {
        if (!cancelled) setCategories([]);
      }
    })();
    return () => { cancelled = true; };
  }, [userId]);

  const addTransaction = async () => {
    if (!form.description || !form.amount) return;
    setSaving(true);
    setError("");
    try {
      const rawAmt = Number.parseFloat(form.amount);
      const signedAmt = form.type === "expense" ? -Math.abs(rawAmt) : Math.abs(rawAmt);
      const categoryId = nameToId[form.category.toLowerCase()] || null;
      const event = await createBalanceEvent(userId, form.description, signedAmt, form.date, categoryId);
      setTxList(prev => [{
        id: event.event_id,
        description: form.description,
        amount: signedAmt,
        date: form.date,
        category: form.category,
        categoryId,
        type: form.type,
      }, ...prev]);
      setShowAdd(false);
      setForm({
        description: "", 
        category: "Groceries", 
        amount: "", 
        type: "expense",
        date: new Date().toISOString().slice(0, 10),
      });
    } catch {
      setError("Failed to save transaction. Check that the Flask API is running");
    }
    setSaving(false);
  };

  const deleteTx = async (id) => {
    try {
      await deleteBalanceEvent(id);
      setTxList(prev => prev.filter(t => t.id !== id));
      if (editId === id) setEditId(null);
    } catch {
      setError("Failed to delete transaction.");
    }
  };

  const startEdit = (tx) => {
    setEditId(tx.id);
    setEditForm({
      description: tx.description,
      amount: Math.abs(tx.amount).toString(),
      date: tx.date,
      type: tx.type,
      category: tx.category,
    });
  };

  const saveEdit = async (id) => {
    try {
      const rawAmt = Number.parseFloat(editForm.amount) || 0;
      const signedAmt = editForm.type === "expense" ? -Math.abs(rawAmt) : Math.abs(rawAmt);
      const categoryId = nameToId[(editForm.category || "").toLowerCase()] || null;
      await updateBalanceEvent(id, editForm.description, signedAmt, categoryId);
      setTxList(prev => prev.map(t => t.id === id ? {
        ...t,
        description: editForm.description,
        amount: signedAmt,
        date: editForm.date,
        category: editForm.category,
        categoryId,
        type: editForm.type,
      } : t));
      setEditId(null);
    } catch {
      setError("Failed to update transaction.");
    }
  };

  // Attach a readable category name to each tx. Rows saved locally (create/edit)
  // already carry the name; rows freshly loaded from the backend only carry a
  // category_id, so we resolve it here against the loaded categories.
  const displayTx = useMemo(() => {
    const idToName = {};
    for (const c of categories) idToName[c.category_id] = c.name;
    return txList.map(t => ({
      ...t,
      category: t.category || idToName[t.categoryId] || "Other",
    }));
  }, [txList, categories]);

  const filtered = displayTx.filter(t => {
    const typeOk = filter === "all" || t.type === filter;
    const catOk  = catFilter === "all" || t.category === catFilter;
    return typeOk && catOk;
  });

  const total = filtered.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
        <div>
          <h1>Transactions</h1>
          <p>Track and categorize every dollar in and out</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>+ Add Transaction</button>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: 16 }}>{error}</div>}

      {showAdd && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="section-title">New Transaction</div>
          <div className="grid-2" style={{ gap: 16 }}>
            <div className="form-group">
              <label htmlFor="form-description">Description</label>
              <input id="form-description" placeholder="e.g. Wegmans grocery run" value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="form-amount">Amount ($)</label>
              <input id="form-amount" type="number" placeholder="0.00" value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="form-group">
              <label htmlFor="form-category">Category</label>
              <select id="form-category" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {categoryOptions.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="form-type">Type</label>
              <select id="form-type" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="form-date">Date</label>
              <input id="form-date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btn btn-primary" onClick={addTransaction} disabled={saving}>
              {saving ? "Saving..." : "Add"}
            </button>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap"}}>
        {["all", "income", "expense"].map(f => (
          <button key={f} className={`btn ${filter === f ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "7px 16px", fontSize: 12, textTransform: "capitalize" }}
            onClick={() => setFilter(f)}>{f}</button>
        ))}
        <div style={{ width: 1, background: "var(--border)", margin: "0 6px" }} />
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          style={{ width: "auto", padding: "7px 12px", fontSize: 12 }}>
          <option value="all">All Categories</option>
          {categoryOptions.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Loading transactions...</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border)" }}>
                  {["Date", "Description", "Category", "Type", "Amount", ""].map(h => (
                    <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => {
                  const isEditing = editId === tx.id;
                  return isEditing ? (
                    <tr key={tx.id} style={{ borderBottom: "1px solid var(--border)", background: "var(--surface2)" }}>
                      <td style={{ padding: "10px 12px" }}>
                        <input type="date" value={editForm.date}
                          onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                          style={{ fontSize: 12, padding: "3px 6px", width: 130 }} />
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <input value={editForm.description}
                          onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                          style={{ fontSize: 13, padding: "3px 6px", width: "100%" }} />
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <select value={editForm.category}
                          onChange={e => setEditForm({ ...editForm, category: e.target.value })}
                          style={{ fontSize: 12, padding: "3px 6px" }}>
                          {categoryOptions.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <select value={editForm.type}
                          onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                          style={{ fontSize: 12, padding: "3px 6px" }}>
                          <option value="expense">expense</option>
                          <option value="income">income</option>
                        </select>
                      </td>
                      <td style={{ padding: "10px 12px" }}>
                        <input type="number" value={editForm.amount}
                          onChange={e => setEditForm({ ...editForm, amount: e.target.value })}
                          style={{ fontSize: 12, padding: "3px 6px", width: 80, textAlign: "right" }} />
                      </td>
                      <td style={{ padding: "10px 12px", whiteSpace: "nowrap" }}>
                        <button className="btn btn-primary" style={{ fontSize: 11, padding: "4px 10px", marginRight: 6 }}
                          onClick={() => saveEdit(tx.id)}>Save</button>
                        <button className="btn btn-ghost" style={{ fontSize: 11, padding: "4px 10px" }}
                          onClick={() => setEditId(null)}>Cancel</button>
                      </td>
                    </tr>
                  ) : (
                    <tr key={tx.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.1s", cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--surface2)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      onClick={() => startEdit(tx)}>
                      <td style={{ padding: "14px 20px", fontSize: 12, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>{tx.date}</td>
                      <td style={{ padding: "14px 20px", fontWeight: 500 }}>{tx.description}</td>
                      <td style={{ padding: "14px 20px" }}>
                        <span className="tag tag-blue" style={{ fontSize: 10 }}>{tx.category}</span>
                      </td>
                      <td style={{ padding: "14px 20px" }}>
                        <span className={`tag ${tx.type === "income" ? "tag-green" : "tag-red"}`} style={{ fontSize: 10 }}>{tx.type}</span>
                      </td>
                      <td style={{ padding: "14px 20px", fontFamily: "'DM Mono', monospace", fontWeight: 600, color: tx.amount > 0 ? "var(--accent)" : "var(--danger)" }}>
                        {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                      </td>
                      <td style={{ padding: "14px 20px" }} onClick={e => e.stopPropagation()}>
                        <button onClick={() => deleteTx(tx.id)}
                          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14 }}>{"\u{2715}"}</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {!loading && filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No transactions found</div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 16, color: "var(--text-muted)", fontSize: 12 }}>
        {filtered.length} transaction{filtered.length === 1 ? "" : "s"} ·{" "}
        Total:{" "}
        <span className="mono" style={{ color: total >= 0 ? "var(--accent)" : "var(--danger)" }}>
          {total >= 0 ? "+" : ""}${Math.abs(total).toFixed(2)}
        </span>
        <span style={{ marginLeft: 12, opacity: 0.7 }}>click any row to edit</span>
      </div>
    </div>
  );
}