import { useMemo, useState } from "react";
import { useApp, useDay, useWeek } from "../lib/useApp.jsx";
import { formatTokyoDate, tokyoISODate, weekdayLabel } from "../lib/tokyo.js";
import { restStatus } from "../lib/restDays.js";
import { dayKind, getSession, PILLARS } from "../lib/program.js";

export default function GymPage() {
  const today = tokyoISODate();
  const [selected, setSelected] = useState(today);
  const { actor, auth } = useApp();
  const week = useWeek(selected);
  const day = useDay(selected);
  const planned = week.plan[selected];
  const session = getSession(day.workout.sessionId || planned?.sessionId);
  const rest = restStatus(week.weekDates, week.restDays);
  const [picking, setPicking] = useState(false);
  const restEdit = picking || !rest.ok;

  function toggleRest(date) {
    const next = week.restDays.includes(date)
      ? week.restDays.filter((item) => item !== date)
      : [...week.restDays, date].slice(-2).sort();
    week.setRestDays(next);
    if (next.length === 2) setPicking(false);
  }

  const completedCount = useMemo(() => {
    const ids = session.blocks?.flatMap((block) => block.items.map((item) => item.id)) || [];
    return ids.filter((id) => day.workout.completed?.[id]?.done).length;
  }, [session, day.workout.completed]);

  return (
    <div className="stack">
      <section className="hero-card compact">
        <p className="kicker">Gym · Mon–Sun</p>
        <h1>Hockey week in Tokyo</h1>
        <p className="lede">
          Five training days. Two rest days, taken from this week’s games — not a fixed Monday or
          Friday. Pillars: explosiveness, cardio, recoverability, strength.
        </p>
      </section>

      <section className="panel">
        <header className="panel-head">
          <h2>This week</h2>
          <div className="row-actions">
            {rest.ok ? (
              <button type="button" className="text-btn" onClick={() => setPicking((value) => !value)}>
                {restEdit ? "Done" : "Change rest days"}
              </button>
            ) : null}
            {week.hasOverride ? (
              <button type="button" className="text-btn" onClick={week.clearRestOverride}>
                Use games again
              </button>
            ) : null}
          </div>
        </header>
        {!rest.ok ? (
          <p className="callout">
            Pick {rest.needed} more rest day{rest.needed === 1 ? "" : "s"} from this week, or add
            games on the calendar.
          </p>
        ) : (
          <p className="muted">
            Rest: {week.restDays.map((date) => `${weekdayLabel(date)} ${date.slice(8)}`).join(" and ")}.
          </p>
        )}
        <div className="week-strip">
          {week.weekDates.map((date) => {
            const dayPlan = week.plan[date];
            const kind = dayKind(dayPlan.sessionId);
            return (
              <button
                key={date}
                type="button"
                className={`week-cell button ${selected === date ? "is-today" : ""} ${kind}`}
                onClick={() => (restEdit ? toggleRest(date) : setSelected(date))}
              >
                <b>{weekdayLabel(date)}</b>
                <span>{date.slice(8)}</span>
                <em>{getSession(dayPlan.sessionId).short}</em>
              </button>
            );
          })}
        </div>
        {restEdit ? <p className="hint">Tap days to mark rest. You need exactly two.</p> : null}
      </section>

      <section className="panel session-panel">
        <header className="panel-head">
          <div>
            <p className="kicker">{formatTokyoDate(selected, { year: undefined })}</p>
            <h2>{session.title}</h2>
          </div>
          <span className="chip">{session.duration}</span>
        </header>
        <p>{session.intent}</p>
        <div className="chip-row">
          {session.pillars?.map((pillar) => (
            <span key={pillar} className="chip">
              {PILLARS.find((item) => item.id === pillar)?.label}
            </span>
          ))}
        </div>

        {session.warmup?.length ? (
          <div className="block">
            <h3>Warm-up</h3>
            <ul>
              {session.warmup.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {session.blocks?.map((block) => (
          <div className="block" key={block.name}>
            <h3>{block.name}</h3>
            <ul className="exercise-list">
              {block.items.map((item) => {
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
                          {item.rx} · rest {item.rest}
                        </em>
                        <small>{item.cue}</small>
                      </span>
                    </label>
                    <input
                      className="inline"
                      placeholder="kg × reps"
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
            </ul>
          </div>
        ))}

        {session.finish ? (
          <p className="finish">
            <strong>Finish.</strong> {session.finish}
          </p>
        ) : null}

        <div className="grid-2">
          <label>
            Session RPE (1–10)
            <input
              type="number"
              min="1"
              max="10"
              value={day.workout.rpe}
              onChange={(event) => day.setWorkout({ rpe: event.target.value, sessionId: session.id })}
            />
          </label>
          <label>
            How it felt
            <input
              value={day.workout.notes}
              onChange={(event) => day.setWorkout({ notes: event.target.value, sessionId: session.id })}
              placeholder={actor === "nutritionist" ? "Nix’s gym note" : "Caleb’s gym note"}
            />
          </label>
        </div>
        <p className="muted">
          {completedCount} movements ticked. Logged as {auth.username}.
        </p>
      </section>
    </div>
  );
}
