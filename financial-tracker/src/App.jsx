import { useState } from "react";
import Dashboard from "./pages/Dashboard";
import Budget from "./pages/Budget";
import Goals from "./pages/Goals";
import Transactions from "./pages/Transactions";
import Savings from "./pages/Savings";
import Sidebar from "./components/Sidebar";
import { UserProvider } from "./context/UserContext";
import "./App.css";

function AppShell() {
  const [activePage, setActivePage] = useState("dashboard");

  const pages = { dashboard: Dashboard, budget: Budget, goals: Goals, transactions: Transactions, savings: Savings };

  const ActivePage = pages[activePage];

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="main-content">
        <ActivePage />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <AppShell />
    </UserProvider>
  );
}