import { useMemo, useState } from "react";
import { useApp, useDay, useWeek } from "../lib/useApp.jsx";
import {
  formatTokyoDate,
  mondayOfWeek,
  monthGrid,
  tokyoISODate,
  tokyoParts,
  weekdayLabel,
  weekDatesFromMonday,
  WEEK_DAYS,
} from "../lib/tokyo.js";
import { resolveRestDays, restStatus } from "../lib/restDays.js";
import { dayKind, getSession, planWeek } from "../lib/program.js";

export default function CalendarPage() {
  const now = tokyoParts();
  const today = tokyoISODate();
  const [cursor, setCursor] = useState({ year: now.year, month: now.month });
  const [selected, setSelected] = useState(today);
  const { state } = useApp();
  const week = useWeek(selected);
  const day = useDay(selected);
  const rest = restStatus(week.weekDates, week.restDays);
  const cells = useMemo(() => monthGrid(cursor.year, cursor.month), [cursor]);
  const monthLabel = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(cursor.year, cursor.month - 1, 1)));

  function shiftMonth(delta) {
    const date = new Date(Date.UTC(cursor.year, cursor.month - 1 + delta, 1));
    setCursor({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 });
  }

  const planned = week.plan[selected];
  const session = getSession(planned?.sessionId);

  return (
    <div className="stack">
      <section className="hero-card compact">
        <p className="kicker">Calendar · Asia/Tokyo</p>
        <h1>Games drive the week</h1>
        <p className="lede">
          Put this week’s games on the calendar. The two rest-from-gym days come from those games.
          Gym and food sit on the same Tokyo week.
        </p>
      </section>

      <section className="panel">
        <header className="panel-head">
          <button type="button" className="text-btn" onClick={() => shiftMonth(-1)}>
            Previous
          </button>
          <h2>{monthLabel}</h2>
          <button type="button" className="text-btn" onClick={() => shiftMonth(1)}>
            Next
          </button>
        </header>
        <div className="month-grid">
          {WEEK_DAYS.map((label) => (
            <div key={label} className="month-dow">
              {label}
            </div>
          ))}
          {cells.map((cell) => {
            const weekDates = weekDatesFromMonday(mondayOfWeek(cell.iso));
            const restDays = resolveRestDays(weekDates, state.games, state.restOverrides);
            const restOk = restDays.length === 2;
            const cellPlan = planWeek({ weekDates, restDays, games: state.games })[cell.iso];
            const kind = restOk || state.games[cell.iso] ? dayKind(cellPlan?.sessionId) : "";
            const hasGame = Boolean(state.games[cell.iso]);
            const hasFood = (state.foodLogs[cell.iso]?.meals || []).length > 0;
            return (
              <button
                key={cell.iso}
                type="button"
                className={`month-cell ${cell.inMonth ? "" : "is-out"} ${cell.iso === selected ? "is-selected" : ""} ${cell.iso === today ? "is-today" : ""} ${kind}`}
                onClick={() => {
                  setSelected(cell.iso);
                  const [year, month] = cell.iso.split("-").map(Number);
                  setCursor({ year, month });
                }}
              >
                <b>{Number(cell.iso.slice(8))}</b>
                <span className="dots">
                  {hasGame ? <i className="dot game" /> : null}
                  {restOk && kind === "rest" ? <i className="dot rest" /> : null}
                  {restOk && kind === "train" ? <i className="dot train" /> : null}
                  {hasFood ? <i className="dot food" /> : null}
                </span>
              </button>
            );
          })}
        </div>
        <p className="legend">
          <span>
            <i className="dot game" /> Game
          </span>
          <span>
            <i className="dot rest" /> Rest
          </span>
          <span>
            <i className="dot train" /> Gym
          </span>
          <span>
            <i className="dot food" /> Food logged
          </span>
        </p>
      </section>

      <section className="panel">
        <header className="panel-head">
          <div>
            <p className="kicker">{weekdayLabel(selected)}</p>
            <h2>{formatTokyoDate(selected)}</h2>
          </div>
          <span className={`chip ${dayKind(session.id)}`}>{session.short}</span>
        </header>
        <p>{planned?.reason}</p>
        {!rest.ok ? (
          <p className="callout">This Tokyo week still needs two rest days from its games.</p>
        ) : (
          <p className="muted">
            Week rest days: {week.restDays.map((date) => `${weekdayLabel(date)} ${date.slice(8)}`).join(" · ")}
          </p>
        )}

        <div className="game-form">
          <label className="check pill">
            <input
              type="checkbox"
              checked={Boolean(day.game)}
              onChange={(event) => day.setGame(event.target.checked ? { time: "14:00" } : null)}
            />
            Game day
          </label>
          {day.game ? (
            <div className="grid-2">
              <label>
                Puck drop (Tokyo)
                <input
                  type="time"
                  value={day.game.time || "14:00"}
                  onChange={(event) => day.setGame({ time: event.target.value })}
                />
              </label>
              <label>
                Opponent / event
                <input
                  value={day.game.opponent || ""}
                  onChange={(event) => day.setGame({ opponent: event.target.value })}
                  placeholder="Who are you playing?"
                />
              </label>
              <label>
                Rink / city
                <input
                  value={day.game.location || ""}
                  onChange={(event) => day.setGame({ location: event.target.value })}
                />
              </label>
              <label>
                Game note
                <input
                  value={day.game.notes || ""}
                  onChange={(event) => day.setGame({ notes: event.target.value })}
                />
              </label>
            </div>
          ) : null}
        </div>

        <label>
          Day note
          <textarea
            rows="3"
            value={day.note}
            onChange={(event) => day.setNote(event.target.value)}
            placeholder="Travel, physio, sleep, rink time…"
          />
        </label>
      </section>
    </div>
  );
}
