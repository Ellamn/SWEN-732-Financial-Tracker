import { useState } from "react";
import { transactions as initialTx } from "../data/fakeData";

{/*TODO: cannot hardcode categories - define categories, share with team*/}
const ALL_CATEGORIES = ["Groceries", "Dining Out", "Rent", "Transport", "Entertainment", "Health", "Subscriptions", "Utilities", "Clothing", "Job", "Financial Aid", "Freelance", "Family", "Other"];

{/*TODO: move all the styles to a seperate Transactions.css */}
export default function Transactions() {
  {/*TODO: can't just add the new transaction to a list, need to retrieve from/ add to database */}
  const [txList, setTxList] = useState(initialTx);
  const [filter, setFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ description: "", category: "Groceries", amount: "", type: "expense", date: new Date().toISOString().slice(0, 10) });

  const filtered = txList.filter(t => {
    const typeOk = filter === "all" || t.type === filter;
    const catOk = catFilter === "all" || t.category === catFilter;
    return typeOk && catOk;
  });

  {/*TODO: can't just add the new transaction to a list, need to retrieve from/add to database */}
  const addTransaction = () => {
    if (!form.description || !form.amount) return;
    const amt = parseFloat(form.amount);
    const newTx = {
      id: Date.now(),
      ...form,
      amount: form.type === "expense" ? -Math.abs(amt) : Math.abs(amt),
    };
    setTxList([newTx, ...txList]);
    setShowAdd(false);
    setForm({ description: "", category: "Groceries", amount: "", type: "expense", date: new Date().toISOString().slice(0, 10) });
  };

  {/*TODO: can't just delete the transactions from the list, need to delete from the database */}
  const deleteTx = (id) => {
    setTxList(txList.filter(t => t.id !== id));
  }

  return (
    <div>
      {/* "transactions" header */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1>Transactions</h1>
          <p>Track and categorize every dollar in and out</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>+ Add Transaction</button>
      </div>

      {/* "new transaction" setting that pops up when you hit "+ Add Transaction" button */}
      {showAdd && (
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="section-title">New Transaction</div>
          <div className="grid-2" style={{ gap: 16 }}>
            <div className="form-group">
              <label>Description</label>
              <input placeholder="e.g. Wegmans grocery run" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Amount ($)</label>
              <input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {ALL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
            <div className="form-group">
              <label>Date</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
            <button className="btn btn-primary" onClick={addTransaction}>Add</button>
            <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* "All", "Income", "Expense" and "Categories" dropdown filters */}
      {/*TODO: remove ALL_CATEGORIES, get that from database */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {["all", "income", "expense"].map(f => (
          <button key={f} className={`btn ${filter === f ? "btn-primary" : "btn-ghost"}`}
            style={{ padding: "7px 16px", fontSize: 12, textTransform: "capitalize" }}
            onClick={() => setFilter(f)}>{f}</button>
        ))}
        <div style={{ width: 1, background: "var(--border)", margin: "0 6px" }} />
        <select
          value={catFilter}
          onChange={e => setCatFilter(e.target.value)}
          style={{ width: "auto", padding: "7px 12px", fontSize: 12 }}
        >
          <option value="all">All Categories</option>
          {ALL_CATEGORIES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* transactions list */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Date", "Description", "Category", "Type", "Amount", ""].map(h => (
                  <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx, i) => (
                <tr key={tx.id} style={{ borderBottom: "1px solid var(--border)", transition: "background 0.1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "var(--surface2)"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "14px 20px", fontSize: 12, color: "var(--text-muted)", fontFamily: "'DM Mono', monospace" }}>{tx.date}</td>
                  <td style={{ padding: "14px 20px", fontWeight: 500 }}>{tx.description}</td>
                  <td style={{ padding: "14px 20px" }}>
                    <span className="tag tag-blue" style={{ fontSize: 10 }}>{tx.category}</span>
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <span className={`tag ${tx.type === "income" ? "tag-green" : "tag-red"}`} style={{ fontSize: 10 }}>
                      {tx.type}
                    </span>
                  </td>
                  <td style={{ padding: "14px 20px", fontFamily: "'DM Mono', monospace", fontWeight: 600, color: tx.amount > 0 ? "var(--accent)" : "var(--danger)" }}>
                    {tx.amount > 0 ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                  </td>
                  <td style={{ padding: "14px 20px" }}>
                    <button onClick={() => deleteTx(tx.id)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 14 }}>✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>No transactions found.</div>
          )}
        </div>
      </div>

      <div style={{ marginTop: 16, color: "var(--text-muted)", fontSize: 12 }}>
        {filtered.length} transaction{filtered.length !== 1 ? "s" : ""} ·{" "}
        Total: <span className="mono" style={{ color: (() => { const s = filtered.reduce((acc, t) => acc + t.amount, 0); return s >= 0 ? "var(--accent)" : "var(--danger)"; })() }}>
          {(() => { const s = filtered.reduce((acc, t) => acc + t.amount, 0); return `${s >= 0 ? "+" : ""}$${Math.abs(s).toFixed(2)}`; })()}
        </span>
      </div>
    </div>
  );
}