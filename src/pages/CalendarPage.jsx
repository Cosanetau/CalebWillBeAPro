import { useMemo, useState } from "react";
import { useApp, useDay, useWeek } from "../lib/useApp.jsx";
import {
  formatDate,
  monthGrid,
  localISODate,
  localParts,
  weekdayLabel,
  WEEK_DAYS,
} from "../lib/dates.js";
import { isRestDay } from "../lib/restDays.js";
import { calendarKind, sessionForDate } from "../lib/program.js";
import { formatWeightKg } from "../lib/nutrition.js";

export default function CalendarPage() {
  const now = localParts();
  const today = localISODate();
  const [cursor, setCursor] = useState({ year: now.year, month: now.month });
  const [selected, setSelected] = useState(today);
  const { state, patch } = useApp();
  const week = useWeek(selected);
  const day = useDay(selected);
  const restMap = week.restMap;
  const cells = useMemo(() => monthGrid(cursor.year, cursor.month), [cursor]);
  const monthLabel = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(cursor.year, cursor.month - 1, 1)));
  const session = sessionForDate(selected, restMap);
  const selectedRest = isRestDay(selected, restMap);
  const kind = calendarKind({ isGame: Boolean(day.game), isRest: selectedRest });

  function pickDay(iso) {
    setSelected(iso);
    const [year, month] = iso.split("-").map(Number);
    setCursor({ year, month });
  }

  function shiftMonth(delta) {
    const date = new Date(Date.UTC(cursor.year, cursor.month - 1 + delta, 1));
    setCursor({ year: date.getUTCFullYear(), month: date.getUTCMonth() + 1 });
  }

  function setGameOn(iso, on) {
    patch((current) => {
      const games = { ...current.games };
      if (!on) delete games[iso];
      else games[iso] = { time: "14:00", opponent: "", location: "", notes: "", ...(current.games[iso] || {}) };
      return { ...current, games };
    });
  }

  return (
    <div className="stack">
      <section className="hero-card compact">
        <p className="kicker">Calendar</p>
        <h1>The month</h1>
        <p className="lede">Tick game or rest on the day. The Gym weigh-in sits under the date.</p>
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
            const weight = formatWeightKg(state.foodLogs[cell.iso]?.weightKg);
            const cellKind = calendarKind({ isGame: hasGame, isRest: cellRest });
            return (
              <div
                key={cell.iso}
                role="button"
                tabIndex={0}
                className={`month-cell ${cell.inMonth ? "" : "is-out"} ${cell.iso === selected ? "is-selected" : ""} ${cell.iso === today ? "is-today" : ""} ${cellKind}`}
                onClick={() => pickDay(cell.iso)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    pickDay(cell.iso);
                  }
                }}
              >
                <b className="cell-date">{Number(cell.iso.slice(8))}</b>
                {weight ? <span className="cell-weight">{weight}</span> : null}
                <div
                  className="cell-flags"
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <label>
                    <input
                      type="checkbox"
                      checked={hasGame}
                      onChange={(event) => {
                        pickDay(cell.iso);
                        setGameOn(cell.iso, event.target.checked);
                      }}
                    />
                    Game
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={cellRest}
                      onChange={(event) => {
                        pickDay(cell.iso);
                        week.setRest(cell.iso, event.target.checked);
                      }}
                    />
                    Rest
                  </label>
                </div>
              </div>
            );
          })}
        </div>
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
        {formatWeightKg(day.food.weightKg) ? (
          <p className="muted">Weigh-in {formatWeightKg(day.food.weightKg)} from Gym.</p>
        ) : null}

        <div className="day-options">
          <label className="check pill">
            <input
              type="checkbox"
              checked={Boolean(day.game)}
              onChange={(event) => setGameOn(selected, event.target.checked)}
            />
            Game day
          </label>
          <label className="check pill">
            <input
              type="checkbox"
              checked={selectedRest}
              onChange={(event) => week.setRest(selected, event.target.checked)}
            />
            Rest day
          </label>
        </div>

        {day.game ? (
          <div className="game-form">
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
          </div>
        ) : null}

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
