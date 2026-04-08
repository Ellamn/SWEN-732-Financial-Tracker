import "./Sidebar.css";
import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";

import dashboardIcon from "../assets/dashboard.svg";
import transactionsIcon from "../assets/transactions.svg";
import budgetIcon from "../assets/budget.svg";
import goalsIcon from "../assets/goals.svg";
import savingsIcon from "../assets/savings.svg";
import brandIcon from "../assets/brand.svg";

const NAV = [
  {id:"dashboard", icon: dashboardIcon, label: "Dashboard"},
  {id:"transactions", icon: transactionsIcon, label: "Transactions" },
  {id:"budget", icon: budgetIcon, label: "Budget"},
  {id:"goals", icon: goalsIcon, label: "Goals"},
  {id:"savings", icon: savingsIcon, label: "Savings Plan"},
];

export default function Sidebar({ activePage, setActivePage }) {
  const { userId, username, logout } = useUser();

  // read the balance from localStorage, updated by Dashboard.jsx when user edits it
  const [balance, setBalance] = useState(0);
  useEffect(() => {
    const stored = parseFloat(localStorage.getItem(`balance_${userId}`) || "0");
    setBalance(stored);
    // poll for changes every 2 seconds for cross-component sync 
    const interval = setInterval(() => {
      const latest = parseFloat(localStorage.getItem(`balance_${userId}`) || "0");
      setBalance(latest);
    }, 2000);
    return () => clearInterval(interval);
  }, [userId]);

  return (
    <aside className="sidebar">
      {/* FinTrack header */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <img src={brandIcon} alt="FinTrack logo" />
        </div>
        <div>
          <div className="brand-name">FinTrack</div>
          <div className="brand-sub">Student Edition</div>
        </div>
      </div>

      {/* nav links */}
      <nav className="sidebar-nav">
        {NAV.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? "active" : ""}`}
            onClick={() => setActivePage(item.id)}
          >
            <img src={item.icon} alt={item.label} className="nav-icon" />
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* footer: balance and user and logout */}
      <div className="sidebar-footer">
        <div className="balance-widget">
          <div className="balance-label">Account Balance</div>
          <div className="balance-amount mono">
            ${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="sidebar-user-row">
          <span className="sidebar-username">{username}</span>
          <button className="sidebar-logout" onClick={logout}>Log out</button>
        </div>
      </div>
    </aside>
  );
}