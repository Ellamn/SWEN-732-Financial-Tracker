import { createContext, useContext, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { getUserByName, createUser } from "../api";

const UserCtx = createContext(null);
export const useUser = () => useContext(UserCtx);

// sanitize values before writing to localStorage to prevent tainted data storage
function sanitize(value) {
  return String(value).replace(/[^a-zA-Z0-9\-_. @]/g, "");
}

export function UserProvider({ children }) {

  // bit of a cheat, userId in localStorage so you don't have to login every time you refresh 
  const [userId,     setUserId]     = useState(() => localStorage.getItem("userId") || null);
  const [username,   setUsername]   = useState(() => localStorage.getItem("username") || "");
  const [loginInput, setLoginInput] = useState("");
  const [error,      setError]      = useState("");
  const [loading,    setLoading]    = useState(false);

  const login = async () => {
    if (!loginInput.trim()) return;
    setLoading(true);
    setError("");
    try {
      // for existing user 
      const user = await getUserByName(loginInput.trim());
      localStorage.setItem("userId",   sanitize(user.id));
      localStorage.setItem("username", sanitize(user.name));
      setUserId(user.id);
      setUsername(user.name);
    } catch {
      // user doesn't exist, make a new one 
      try {
        const newUser = await createUser(loginInput.trim());
        localStorage.setItem("userId",   sanitize(newUser.id));
        localStorage.setItem("username", sanitize(newUser.name));
        setUserId(newUser.id);
        setUsername(newUser.name);
      } catch {
        setError("Could not connect to server. Check if Flask API is running.");
      }
    }
    setLoading(false);
  };

  const logout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    setUserId(null);
    setUsername("");
  };

  // so the context value object is stable across renders
  const contextValue = useMemo(
    () => ({ userId, username, logout }),
    [userId, username]
  );

  if (!userId) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <div className="login-emoji">{"\u{1F4B0}"}</div>
          <h2 className="login-title">Budget Tracker</h2>
          <p className="login-subtitle">
            Enter your username to continue. We'll create an account if you're new here.
          </p>
          <input
            className="login-input"
            placeholder="Username"
            value={loginInput}
            onChange={e => setLoginInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && login()}
          />
          {error && <div className="login-error">{error}</div>}
          <button className="btn btn-primary login-btn" onClick={login} disabled={loading}>
            {loading ? "Connecting ..." : "Continue"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <UserCtx.Provider value={contextValue}>
      {children}
    </UserCtx.Provider>
  );
}

UserProvider.propTypes = {
  children: PropTypes.node.isRequired,
};