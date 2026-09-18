import { Link } from "react-router-dom";
import { useApp, useDay, useWeek } from "../lib/useApp.jsx";
import { formatTokyoDate, tokyoISODate, weekdayLabel } from "../lib/tokyo.js";
import { restStatus } from "../lib/restDays.js";
import { dayKind, getSession, pillarsCovered } from "../lib/program.js";
import { mealTotals, targetsFor } from "../lib/nutrition.js";

export default function TodayPage() {
  const { state, patch } = useApp();
  const today = tokyoISODate();
  const week = useWeek(today);
  const day = useDay(today);
  const planned = week.plan[today];
  const session = getSession(planned?.sessionId);
  const kind = dayKind(planned?.sessionId);
  const targets = targetsFor(kind, Number(state.profile.weightKg) || 82);
  const totals = mealTotals(day.food.meals);
  const rest = restStatus(week.weekDates, week.restDays);
  const pillars = pillarsCovered(week.plan);

  return (
    <div className="stack">
      <section className="hero-card">
        <p className="kicker">Today</p>
        <h1>{formatTokyoDate(today)}</h1>
        <p className="lede">
          {session.title}. {planned?.reason}
        </p>
        <div className="chip-row">
          <span className={`chip ${kind}`}>{kind === "game" ? "Game" : kind === "rest" ? "Off gym" : "Train"}</span>
          {day.game ? (
            <span className="chip game">
              {day.game.time || "TBC"}
              {day.game.opponent ? ` vs ${day.game.opponent}` : ""}
            </span>
          ) : null}
        </div>
      </section>

      {!rest.ok ? (
        <section className="alert-card">
          <h2>Still need two rest days</h2>
          <p>They come from this week’s games, not a standing Monday off. Put the games in, or pick the days on Gym.</p>
          <div className="row-actions">
            <Link className="btn" to="/calendar">
              Add games
            </Link>
            <Link className="btn ghost" to="/gym">
              Pick rest days
            </Link>
          </div>
        </section>
      ) : null}

      <section className="grid-2">
        <article className="panel">
          <header className="panel-head">
            <h2>Gym</h2>
            <Link to="/gym">open</Link>
          </header>
          <p>{session.intent}</p>
          <ul className="compact">
            {(session.blocks?.[0]?.items || []).slice(0, 3).map((item) => (
              <li key={item.id}>
                {item.name} — {item.rx}
              </li>
            ))}
          </ul>
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
          <p className="muted">{targets.note}</p>
        </article>
      </section>

      <section className="panel">
        <header className="panel-head">
          <h2>This week</h2>
          <Link to="/calendar">calendar</Link>
        </header>
        <div className="pillar-grid">
          {pillars.map((pillar) => (
            <div key={pillar.id} className={`pillar ${pillar.covered ? "is-on" : ""}`}>
              <strong>{pillar.label}</strong>
              <span>{pillar.blurb}</span>
            </div>
          ))}
        </div>
        <div className="week-strip">
          {week.weekDates.map((date) => {
            const dayPlan = week.plan[date];
            return (
              <Link
                key={date}
                to={dayKind(dayPlan.sessionId) === "rest" || dayKind(dayPlan.sessionId) === "game" ? "/calendar" : "/gym"}
                className={`week-cell ${date === today ? "is-today" : ""} ${dayKind(dayPlan.sessionId)}`}
              >
                <b>{weekdayLabel(date)}</b>
                <span>{date.slice(8)}</span>
                <em>{getSession(dayPlan.sessionId).short}</em>
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
          Weight we use for food (kg)
          <input
            type="number"
            min="50"
            max="140"
            step="0.1"
            value={state.profile.weightKg}
            onChange={(event) => patch({ profile: { ...state.profile, weightKg: event.target.value } })}
          />
        </label>
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
