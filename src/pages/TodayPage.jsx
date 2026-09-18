import { Link } from "react-router-dom";
import { useApp, useDay, useWeek } from "../lib/useApp.jsx";
import { formatTokyoDate, tokyoISODate, weekdayLabel } from "../lib/tokyo.js";
import { foodKind, sessionForDate } from "../lib/program.js";
import { rxLine, sessionItems } from "../data/sessions.js";
import { mealTotals, targetsFor } from "../lib/nutrition.js";

export default function TodayPage() {
  const { state, patch } = useApp();
  const today = tokyoISODate();
  const week = useWeek(today);
  const day = useDay(today);
  const session = sessionForDate(today, week.restMap);
  const kind = foodKind({ isGame: Boolean(day.game), isRest: session.id === "rest" });
  const targets = targetsFor(kind, Number(day.food.weightKg || state.profile.weightKg) || 82);
  const totals = mealTotals(day.food.meals);

  function setWeighIn(value) {
    day.setFood({ weightKg: value });
    patch({ profile: { ...state.profile, weightKg: value } });
  }

  return (
    <div className="stack">
      <section className="hero-card">
        <p className="kicker">Today</p>
        <h1>{formatTokyoDate(today)}</h1>
        <p className="lede">{session.intent}</p>
        <div className="chip-row">
          <span className={`chip ${session.id === "rest" ? "rest" : "train"}`}>{session.title}</span>
          {day.game ? (
            <span className="chip game">
              {day.game.time || "TBC"}
              {day.game.opponent ? ` vs ${day.game.opponent}` : ""}
            </span>
          ) : null}
        </div>
      </section>

      <section className="panel weigh-panel">
        <label>
          Weigh-in (kg)
          <input
            type="number"
            min="40"
            max="160"
            step="0.1"
            value={day.food.weightKg}
            onChange={(event) => setWeighIn(event.target.value)}
            placeholder="Today’s number"
          />
        </label>
      </section>

      <section className="grid-2">
        <article className="panel">
          <header className="panel-head">
            <h2>Gym</h2>
            <Link to="/gym">open</Link>
          </header>
          {session.id === "rest" ? (
            <p>Rest day. Unmark it on Gym if you’re training.</p>
          ) : (
            <ul className="compact">
              {sessionItems(session)
                .filter((item) => !String(item.id).startsWith("wu"))
                .slice(0, 4)
                .map((item) => (
                  <li key={item.id}>
                    {item.name} — {rxLine(item)}
                  </li>
                ))}
            </ul>
          )}
        </article>

        <article className="panel">
          <header className="panel-head">
            <h2>Food</h2>
            <Link to="/food">open</Link>
          </header>
          <p>
            {targets.label} for {targets.weightKg} kg.
          </p>
          <div className="macro-row">
            <Macro label="kcal" value={totals.kcal} goal={targets.kcal} />
            <Macro label="P" value={totals.protein} goal={targets.protein} />
            <Macro label="C" value={totals.carbs} goal={targets.carbs} />
            <Macro label="F" value={totals.fat} goal={targets.fat} />
          </div>
        </article>
      </section>

      <section className="panel">
        <header className="panel-head">
          <h2>This week</h2>
          <Link to="/gym">gym</Link>
        </header>
        <div className="week-strip">
          {week.weekDates.map((date) => {
            const daySession = sessionForDate(date, week.restMap);
            const kind = daySession.id === "rest" ? "rest" : "train";
            return (
              <Link
                key={date}
                to="/gym"
                className={`week-cell ${date === today ? "is-today" : ""} ${kind}`}
              >
                <b>{weekdayLabel(date)}</b>
                <span>{date.slice(8)}</span>
                <em>{daySession.short}</em>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="panel">
        <header className="panel-head">
          <h2>Notes</h2>
        </header>
        <label>
          Team / rink
          <input
            value={state.profile.team}
            onChange={(event) => patch({ profile: { ...state.profile, team: event.target.value } })}
            placeholder="Who you’re skating for"
          />
        </label>
        <label>
          Shared note
          <textarea
            rows="3"
            value={state.profile.notes}
            onChange={(event) => patch({ profile: { ...state.profile, notes: event.target.value } })}
          />
        </label>
      </section>
    </div>
  );
}

function Macro({ label, value, goal }) {
  const pct = goal ? Math.min(100, Math.round((Number(value) / goal) * 100)) : 0;
  return (
    <div className="macro">
      <span>{label}</span>
      <strong>
        {Math.round(value)}
        <small>/{goal}</small>
      </strong>
      <i style={{ width: `${pct}%` }} />
    </div>
  );
}
