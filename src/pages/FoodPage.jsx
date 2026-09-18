import { useState } from "react";
import { foods } from "../data/foods.js";
import { MEAL_SLOTS, SUPPLEMENTS, mealTotals, remaining, targetsFor } from "../lib/nutrition.js";
import { dayKind, getSession } from "../lib/program.js";
import { formatTokyoDate, tokyoISODate, weekdayLabel } from "../lib/tokyo.js";
import { newId } from "../lib/state.js";
import { useApp, useDay, useWeek } from "../lib/useApp.jsx";

export default function FoodPage() {
  const today = tokyoISODate();
  const [selected, setSelected] = useState(today);
  const { state, actor, auth } = useApp();
  const week = useWeek(selected);
  const day = useDay(selected);
  const kind = dayKind(week.plan[selected]?.sessionId);
  const session = getSession(week.plan[selected]?.sessionId);
  const targets = targetsFor(kind, Number(state.profile.weightKg) || 82);
  const totals = mealTotals(day.food.meals);
  const left = remaining(targets, totals);
  const [draft, setDraft] = useState({
    slot: kind === "game" ? "pre" : "breakfast",
    name: "",
    kcal: "",
    protein: "",
    carbs: "",
    fat: "",
  });

  function addMeal(meal) {
    day.setFood({
      meals: [
        ...day.food.meals,
        {
          id: newId(),
          slot: meal.slot || draft.slot,
          name: meal.name,
          kcal: Number(meal.kcal || 0),
          protein: Number(meal.protein || 0),
          carbs: Number(meal.carbs || 0),
          fat: Number(meal.fat || 0),
          actor,
        },
      ],
    });
  }

  function addDraft(event) {
    event.preventDefault();
    if (!draft.name) return;
    addMeal(draft);
    setDraft({ ...draft, name: "", kcal: "", protein: "", carbs: "", fat: "" });
  }

  function removeMeal(id) {
    day.setFood({ meals: day.food.meals.filter((meal) => meal.id !== id) });
  }

  return (
    <div className="stack">
      <section className="hero-card compact">
        <p className="kicker">Food · {auth.username}</p>
        <h1>{targets.label}</h1>
        <p className="lede">
          {session.title}. Numbers move with the day — game, train, or off.
        </p>
      </section>

      <div className="week-strip">
        {week.weekDates.map((date) => (
          <button
            key={date}
            type="button"
            className={`week-cell button ${selected === date ? "is-today" : ""} ${dayKind(week.plan[date].sessionId)}`}
            onClick={() => setSelected(date)}
          >
            <b>{weekdayLabel(date)}</b>
            <span>{date.slice(8)}</span>
            <em>{(state.foodLogs[date]?.meals || []).length} meals</em>
          </button>
        ))}
      </div>

      <section className="panel">
        <header className="panel-head">
          <h2>{formatTokyoDate(selected, { year: undefined })}</h2>
          <span className="chip">{targets.label}</span>
        </header>
        <p className="muted">{targets.note}</p>
        <div className="macro-row large">
          <Macro label="kcal" value={totals.kcal} goal={targets.kcal} left={left.kcal} />
          <Macro label="Protein" value={totals.protein} goal={targets.protein} left={left.protein} />
          <Macro label="Carbs" value={totals.carbs} goal={targets.carbs} left={left.carbs} />
          <Macro label="Fat" value={totals.fat} goal={targets.fat} left={left.fat} />
        </div>
      </section>

      <section className="panel">
        <header className="panel-head">
          <h2>Logged meals</h2>
        </header>
        {MEAL_SLOTS.map((slot) => {
          const items = day.food.meals.filter((meal) => meal.slot === slot.id);
          return (
            <div key={slot.id} className="meal-slot">
              <h3>{slot.label}</h3>
              {items.length ? (
                <ul className="meal-list">
                  {items.map((meal) => (
                    <li key={meal.id}>
                      <div>
                        <strong>{meal.name}</strong>
                        <span>
                          {meal.kcal} kcal · P {meal.protein} · C {meal.carbs} · F {meal.fat}
                          {meal.actor === "nutritionist" ? " · Nix" : ""}
                        </span>
                      </div>
                      <button type="button" className="text-btn" onClick={() => removeMeal(meal.id)}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Nothing logged.</p>
              )}
            </div>
          );
        })}
      </section>

      <section className="panel">
        <header className="panel-head">
          <h2>Stuff we actually eat</h2>
        </header>
        <div className="food-grid">
          {foods.map((food) => (
            <button key={food.id} type="button" className="food-card" onClick={() => addMeal(food)}>
              <strong>{food.name}</strong>
              <span>
                {food.kcal} kcal · P{food.protein} C{food.carbs} F{food.fat}
              </span>
            </button>
          ))}
        </div>
        <form className="custom-meal" onSubmit={addDraft}>
          <h3>Custom</h3>
          <div className="grid-2">
            <label>
              Slot
              <select value={draft.slot} onChange={(event) => setDraft({ ...draft, slot: event.target.value })}>
                {MEAL_SLOTS.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Name
              <input
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                placeholder="What did you eat?"
              />
            </label>
          </div>
          <div className="macro-inputs">
            {["kcal", "protein", "carbs", "fat"].map((key) => (
              <label key={key}>
                {key}
                <input
                  type="number"
                  min="0"
                  value={draft[key]}
                  onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
                />
              </label>
            ))}
          </div>
          <button type="submit" className="btn">
            Add it
          </button>
        </form>
      </section>

      <section className="panel">
        <header className="panel-head">
          <h2>Check-in</h2>
        </header>
        <label>
          Water (L) · target {targets.waterL}
          <input
            type="number"
            step="0.1"
            min="0"
            value={day.food.waterL}
            onChange={(event) => day.setFood({ waterL: event.target.value })}
          />
        </label>
        <div className="supp-row">
          {SUPPLEMENTS.map((item) => (
            <label key={item.id} className="check pill">
              <input
                type="checkbox"
                checked={Boolean(day.food.supplements?.[item.id])}
                onChange={(event) =>
                  day.setFood({
                    supplements: { ...day.food.supplements, [item.id]: event.target.checked },
                  })
                }
              />
              {item.label}
            </label>
          ))}
        </div>
        <div className="grid-2">
          <label>
            Morning weight (kg)
            <input
              type="number"
              step="0.1"
              value={day.food.weightKg}
              onChange={(event) => day.setFood({ weightKg: event.target.value })}
            />
          </label>
          <label>
            Energy 1–5
            <input
              type="number"
              min="1"
              max="5"
              value={day.food.energy}
              onChange={(event) => day.setFood({ energy: event.target.value })}
            />
          </label>
        </div>
        <label>
          Caleb note
          <textarea
            rows="2"
            value={day.food.athleteNote}
            onChange={(event) => day.setFood({ athleteNote: event.target.value })}
            placeholder="How food sat, travel, rink snacks…"
          />
        </label>
        <label>
          Nutritionist note
          <textarea
            className="coach-note"
            rows="3"
            value={day.food.nutritionistNote}
            onChange={(event) => day.setFood({ nutritionistNote: event.target.value })}
            placeholder="Adjustments, game-day timing, what to shop…"
          />
        </label>
      </section>
    </div>
  );
}

function Macro({ label, value, goal, left }) {
  const pct = goal ? Math.min(100, Math.round((Number(value) / goal) * 100)) : 0;
  return (
    <div className="macro">
      <span>{label}</span>
      <strong>
        {Math.round(value)}
        <small>/{goal}</small>
      </strong>
      <i style={{ width: `${pct}%` }} />
      <em>{left >= 0 ? `${Math.round(left)} left` : `${Math.round(Math.abs(left))} over`}</em>
    </div>
  );
}
