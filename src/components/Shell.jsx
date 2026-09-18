import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { CalendarDays, Dumbbell, Home, LogOut, UtensilsCrossed } from "lucide-react";
import { tokyoClock, tokyoISODate, formatTokyoDate } from "../lib/tokyo.js";
import { useApp } from "../lib/useApp.jsx";

const links = [
  { to: "/", label: "Today", icon: Home, end: true },
  { to: "/gym", label: "Gym", icon: Dumbbell },
  { to: "/food", label: "Food", icon: UtensilsCrossed },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
];

export default function Shell() {
  const { actor, setActor, lock, saveError, savedAt } = useApp();
  const [now, setNow] = useState(() => new Date());
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!savedAt) return undefined;
    setShowSaved(true);
    const timer = setTimeout(() => setShowSaved(false), 2500);
    return () => clearTimeout(timer);
  }, [savedAt]);

  const today = tokyoISODate(now);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="mark" aria-hidden="true" />
          <div>
            <p className="brand-name">Caleb Will Be A Pro</p>
            <p className="brand-sub">Ice hockey · Japan · Tokyo time</p>
          </div>
        </div>

        <nav className="desktop-nav">
          {links.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => (isActive ? "is-active" : "")}>
              <link.icon size={16} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="topbar-meta">
          <div className="tokyo-clock" title="Asia/Tokyo">
            <strong>{tokyoClock(now)}</strong>
            <span>{formatTokyoDate(today, { weekday: "short", month: "short", year: undefined })}</span>
          </div>
          <div className="actor-toggle" role="group" aria-label="Who is using this">
            <button type="button" className={actor === "caleb" ? "is-on" : ""} onClick={() => setActor("caleb")}>
              Caleb
            </button>
            <button
              type="button"
              className={actor === "nutritionist" ? "is-on" : ""}
              onClick={() => setActor("nutritionist")}
            >
              Nutritionist
            </button>
          </div>
          <button type="button" className="icon-btn" onClick={lock} title="Lock">
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {saveError ? <p className="save-banner error">{saveError}</p> : null}
      {showSaved && !saveError ? <p className="save-banner">Saved for both of you.</p> : null}

      <main className="page">
        <Outlet />
      </main>

      <nav className="mobile-nav">
        {links.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => (isActive ? "is-active" : "")}>
            <link.icon size={18} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <footer className="site-foot">
        <span>calebwillbeapro.cosa.net.au</span>
        <span>Shared access word · Asia/Tokyo</span>
      </footer>
    </div>
  );
}
