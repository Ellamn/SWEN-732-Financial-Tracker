import "./Sidebar.css";

/* svgs for the icons */
import dashboardIcon from "../assets/dashboard.svg"; 
import transactionsIcon from "../assets/transactions.svg"; 
import budgetIcon from "../assets/budget.svg";
import goalsIcon from "../assets/goals.svg"; 
import savingsIcon from "../assets/savings.svg"
import brandIcon from "../assets/brand.svg";

const NAV = [
  { id: "dashboard", icon: dashboardIcon, label: "Dashboard" },
  { id: "transactions", icon: transactionsIcon, label: "Transactions" },
  { id: "budget", icon: budgetIcon, label: "Budget" },
  { id: "goals", icon: goalsIcon, label: "Goals" },
  { id: "savings", icon: savingsIcon, label: "Savings Plan" },
];

export default function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="sidebar">
      {/* the FinTrack header for the sidebar */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <img src={brandIcon} alt="FinTrack logo" />
        </div>
        <div>
          <div className="brand-name">FinTrack</div>
          <div className="brand-sub">Student Edition</div>
        </div>
      </div>

      {/* creates all the links to the different pages in the sidebar */}
      <nav className="sidebar-nav">
        {NAV.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activePage === item.id ? "active" : ""}`}
            onClick={() => setActivePage(item.id)}
          >
            <img src={item.icon} alt={item.label} className="nav-icon"/>
            <span className="nav-label">{item.label}</span>
            {activePage === item.id}
          </button>
        ))}
      </nav>

      {/* small box at the bottom of the sidebar showing current account balance */}
      {/* TODO: balance amount cannot be hardcoded lol */}
      <div className="sidebar-footer">
        <div className="balance-widget">
          <div className="balance-label">Account Balance</div>
          <div className="balance-amount mono">$2,847.50</div>
        </div>
      </div>
    </aside>
  );
}