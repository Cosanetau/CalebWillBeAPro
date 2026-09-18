import { useMemo, useState } from "react";
import { useApp, useDay } from "../lib/useApp.jsx";
import {
  formatDate,
  monthGrid,
  localISODate,
  localParts,
  weekdayLabel,
  WEEK_DAYS,
} from "../lib/dates.js";
import { collectRestMap, isRestDay } from "../lib/restDays.js";
import { calendarKind, sessionForDate } from "../lib/program.js";
import { formatWeightKg } from "../lib/nutrition.js";

export default function CalendarPage() {
  const now = localParts();
  const today = localISODate();
  const [cursor, setCursor] = useState({ year: now.year, month: now.month });
  const [selected, setSelected] = useState(today);
  const { state } = useApp();
  const day = useDay(selected);
  const restMap = collectRestMap(state);
  const cells = useMemo(() => monthGrid(cursor.year, cursor.month), [cursor]);
  const monthLabel = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(cursor.year, cursor.month - 1, 1)));
  const session = sessionForDate(selected, restMap);
  const kind = calendarKind({ isGame: Boolean(day.game), isRest: session.id === "rest" });

  function shiftMonth(delta) {
    const date = new Date(Date.UTC(cursor.year, cursor.month - 1 + delta, 1));
    setCursor({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 });
  }

  return (
    <div className="stack">
      <section className="hero-card compact">
        <p className="kicker">Calendar</p>
        <h1>The month</h1>
        <p className="lede">Games go here. Gym is the set week unless you mark rest.</p>
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
            const cellRest = isRestDay(cell.iso, restMap);
            const hasGame = Boolean(state.games[cell.iso]);
            const hasFood = (state.foodLogs[cell.iso]?.meals || []).length > 0;
            const weight = formatWeightKg(state.foodLogs[cell.iso]?.weightKg);
            const cellKind = calendarKind({ isGame: hasGame, isRest: cellRest });
            return (
              <button
                key={cell.iso}
                type="button"
                className={`month-cell ${cell.inMonth ? "" : "is-out"} ${cell.iso === selected ? "is-selected" : ""} ${cell.iso === today ? "is-today" : ""} ${cellKind}`}
                onClick={() => {
                  setSelected(cell.iso);
                  const [year, month] = cell.iso.split("-").map(Number);
                  setCursor({ year, month });
                }}
              >
                <b>{Number(cell.iso.slice(8))}</b>
                {weight ? <span className="cell-weight">{weight}</span> : null}
                <span className="dots">
                  {hasGame ? <i className="dot game" /> : null}
                  {cellRest ? <i className="dot rest" /> : null}
                  {!cellRest ? <i className="dot train" /> : null}
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
            <h2>{formatDate(selected)}</h2>
          </div>
          <span className={`chip ${kind}`}>{session.short}</span>
        </header>
        <p>{session.intent}</p>

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
                Puck drop
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
