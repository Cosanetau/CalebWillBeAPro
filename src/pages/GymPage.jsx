import { useMemo, useState } from "react";
import { useApp, useDay, useWeek } from "../lib/useApp.jsx";
import { formatTokyoDate, tokyoISODate, weekdayLabel } from "../lib/tokyo.js";
import { isRestDay } from "../lib/restDays.js";
import { sessionForDate } from "../lib/program.js";
import { rxLine } from "../data/sessions.js";

export default function GymPage() {
  const today = tokyoISODate();
  const [selected, setSelected] = useState(today);
  const { state, patch, actor, auth } = useApp();
  const week = useWeek(selected);
  const day = useDay(selected);
  const rest = isRestDay(selected, week.restMap);
  const session = sessionForDate(selected, week.restMap);
  const weighIn = day.food.weightKg;

  function setWeighIn(value) {
    day.setFood({ weightKg: value });
    if (selected === today) {
      patch({ profile: { ...state.profile, weightKg: value } });
    }
  }

  const completedCount = useMemo(() => {
    return (session.items || []).filter((item) => day.workout.completed?.[item.id]?.done).length;
  }, [session, day.workout.completed]);

  return (
    <div className="stack">
      <section className="hero-card compact">
        <p className="kicker">Gym</p>
        <h1>{weekdayLabel(selected)} · {session.title}</h1>
        <p className="lede">
          Set sessions for the week. We do the day’s work unless you mark rest.
        </p>
      </section>

      <section className="panel weigh-panel">
        <div className="weigh-row">
          <label>
            Weigh-in (kg)
            <input
              type="number"
              min="40"
              max="160"
              step="0.1"
              value={weighIn}
              onChange={(event) => setWeighIn(event.target.value)}
              placeholder="Today’s number"
            />
          </label>
          <label className="check pill rest-toggle">
            <input type="checkbox" checked={rest} onChange={() => week.toggleRest(selected)} />
            Rest day
          </label>
        </div>
      </section>

      <section className="panel">
        <header className="panel-head">
          <h2>This week</h2>
        </header>
        <div className="week-strip">
          {week.weekDates.map((date) => {
            const daySession = sessionForDate(date, week.restMap);
            const kind = daySession.id === "rest" ? "rest" : "train";
            return (
              <button
                key={date}
                type="button"
                className={`week-cell button ${selected === date ? "is-today" : ""} ${kind}`}
                onClick={() => setSelected(date)}
              >
                <b>{weekdayLabel(date)}</b>
                <span>{date.slice(8)}</span>
                <em>{daySession.short}</em>
              </button>
            );
          })}
        </div>
      </section>

      <section className="panel session-panel">
        <header className="panel-head">
          <div>
            <p className="kicker">{formatTokyoDate(selected, { year: undefined })}</p>
            <h2>{session.title}</h2>
          </div>
        </header>
        <p>{session.intent}</p>

        {rest ? (
          <p className="muted">Off gym today. Uncheck rest if you’re training.</p>
        ) : (
          <ol className="work-list">
            {session.items.map((item) => {
              const log = day.workout.completed?.[item.id] || {};
              return (
                <li key={item.id}>
                  <label className="check">
                    <input
                      type="checkbox"
                      checked={Boolean(log.done)}
                      onChange={(event) =>
                        day.setWorkout({
                          sessionId: session.id,
                          completed: {
                            ...day.workout.completed,
                            [item.id]: { ...log, done: event.target.checked },
                          },
                        })
                      }
                    />
                    <span>
                      <strong>{item.name}</strong>
                      <em>
                        {rxLine(item)}
                      </em>
                    </span>
                  </label>
                  <input
                    className="inline"
                    placeholder="kg"
                    value={log.detail || ""}
                    onChange={(event) =>
                      day.setWorkout({
                        sessionId: session.id,
                        completed: {
                          ...day.workout.completed,
                          [item.id]: { ...log, detail: event.target.value },
                        },
                      })
                    }
                  />
                </li>
              );
            })}
          </ol>
        )}

        <label>
          How it felt
          <input
            value={day.workout.notes}
            onChange={(event) => day.setWorkout({ notes: event.target.value, sessionId: session.id })}
            placeholder={actor === "nutritionist" ? "Nix’s gym note" : "Caleb’s gym note"}
          />
        </label>
        <p className="muted">
          {rest ? "Rest." : `${completedCount} of ${session.items.length} done.`} Logged as {auth.username}.
        </p>
      </section>
    </div>
  );
}
