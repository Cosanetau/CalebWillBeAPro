import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useApp } from "../lib/useApp.jsx";
import TermsFoot from "./TermsFoot.jsx";

const links = [
  { to: "/", label: "Today", end: true },
  { to: "/gym", label: "Gym" },
  { to: "/food", label: "Food" },
  { to: "/cookbook", label: "Cookbook" },
  { to: "/grocery", label: "Grocery" },
  { to: "/calendar", label: "Calendar" },
];

export default function Shell() {
  const { auth, lock, saveError, savedAt } = useApp();
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    if (!savedAt) return undefined;
    setShowSaved(true);
    const timer = setTimeout(() => setShowSaved(false), 2500);
    return () => clearTimeout(timer);
  }, [savedAt]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <p className="brand-name">Caleb will be a pro</p>
          <p className="brand-sub">hockey log</p>
        </div>

        <nav className="desktop-nav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => (isActive ? "is-active" : "")}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="topbar-meta">
          <div className="who">{auth.username}</div>
          <button type="button" className="text-btn" onClick={lock}>
            Out
          </button>
        </div>
      </header>

      {saveError ? <p className="save-banner error">{saveError}</p> : null}
      {showSaved && !saveError ? <p className="save-banner">Saved.</p> : null}

      <main className="page">
        <Outlet />
      </main>

      <nav className="mobile-nav">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => (isActive ? "is-active" : "")}>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <TermsFoot />
    </div>
  );
}
