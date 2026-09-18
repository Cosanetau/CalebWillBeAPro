import { useState } from "react";
import {
  FOOD_UNITS,
  MEAL_SLOTS,
  SUPPLEMENTS,
  amountLine,
  mealTotals,
  remaining,
  targetsFor,
  weekBuyList,
} from "../lib/nutrition.js";
import { foodKind, getSession } from "../lib/program.js";
import { formatDate, localISODate, weekdayLabel } from "../lib/dates.js";
import { newId } from "../lib/state.js";
import { useApp, useDay, useWeek } from "../lib/useApp.jsx";

const emptyDraft = {
  slot: "dinner",
  name: "",
  brand: "",
  amount: "",
  unit: "g",
  kcal: "",
  protein: "",
  carbs: "",
  fat: "",
  notes: "",
};

export default function FoodPage() {
  const today = localISODate();
  const [selected, setSelected] = useState(today);
  const [adding, setAdding] = useState(false);
  const { state, actor, auth, patch } = useApp();
  const week = useWeek(selected);
  const day = useDay(selected);
  const session = getSession(week.plan[selected]?.sessionId);
  const kind = foodKind({
    isGame: Boolean(state.games[selected]),
    isRest: session.id === "rest",
  });
  const targets = targetsFor(kind, Number(day.food.weightKg || state.profile.weightKg) || 82);
  const totals = mealTotals(day.food.meals);
  const left = remaining(targets, totals);
  const shop = weekBuyList(week.weekDates, state.foodLogs);
  const [draft, setDraft] = useState(emptyDraft);

  function addFood(event) {
    event.preventDefault();
    if (!draft.name.trim()) return;
    day.setFood({
      meals: [
        ...day.food.meals,
        {
          id: newId(),
          slot: draft.slot,
          name: draft.name.trim(),
          brand: draft.brand.trim(),
          amount: Number(draft.amount || 0),
          unit: draft.unit,
          kcal: Number(draft.kcal || 0),
          protein: Number(draft.protein || 0),
          carbs: Number(draft.carbs || 0),
          fat: Number(draft.fat || 0),
          notes: draft.notes.trim(),
          actor,
        },
      ],
    });
    setDraft({ ...emptyDraft, slot: draft.slot, unit: draft.unit });
  }

  function removeMeal(id) {
    day.setFood({ meals: day.food.meals.filter((meal) => meal.id !== id) });
  }

  function setWeighIn(value) {
    day.setFood({ weightKg: value });
    if (selected === today) {
      patch({ profile: { ...state.profile, weightKg: value } });
    }
  }

  return (
    <div className="stack">
      <section className="hero-card compact">
        <p className="kicker">Food · {auth.username}</p>
        <h1>The kitchen</h1>
        <p className="lede">Add the ingredients you cook. The shop list fills itself for the week.</p>
      </section>

      <section className="panel">
        <header className="panel-head">
          <h2>This week’s shop</h2>
        </header>
        {shop.length ? (
          <ul className="shop-list">
            {shop.map((item) => (
              <li key={`${item.name}-${item.unit}`}>
                <strong>{item.name}</strong>
                <span>
                  {amountLine(item) || "as added"}
                  {item.kcal ? ` · ${Math.round(item.kcal)} kcal` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Nothing to buy yet. Add food and it shows up here.</p>
        )}
      </section>

      <div className="week-strip">
        {week.weekDates.map((date) => (
          <button
            key={date}
            type="button"
            className={`week-cell button ${selected === date ? "is-today" : ""} ${foodKind({
              isGame: Boolean(state.games[date]),
              isRest: week.plan[date].sessionId === "rest",
            })}`}
            onClick={() => setSelected(date)}
          >
            <b>{weekdayLabel(date)}</b>
            <span>{date.slice(8)}</span>
            <em>{(state.foodLogs[date]?.meals || []).length || "—"}</em>
          </button>
        ))}
      </div>

      <section className="panel">
        <header className="panel-head">
          <h2>{formatDate(selected, { year: undefined })}</h2>
          <button type="button" className="btn" onClick={() => setAdding((value) => !value)}>
            {adding ? "Close" : "Add food"}
          </button>
        </header>
        <p className="muted">{targets.label}. {targets.note}</p>
        <div className="macro-row large">
          <Macro label="kcal" value={totals.kcal} goal={targets.kcal} left={left.kcal} />
          <Macro label="Protein" value={totals.protein} goal={targets.protein} left={left.protein} />
          <Macro label="Carbs" value={totals.carbs} goal={targets.carbs} left={left.carbs} />
          <Macro label="Fat" value={totals.fat} goal={targets.fat} left={left.fat} />
        </div>

        {adding ? (
          <form className="add-food-form" onSubmit={addFood}>
            <h3>Ingredient</h3>
            <div className="grid-2">
              <label>
                Name
                <input
                  autoFocus
                  value={draft.name}
                  onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                  placeholder="Chicken, rice, eggs…"
                />
              </label>
              <label>
                Brand / notes on the pack
                <input
                  value={draft.brand}
                  onChange={(event) => setDraft({ ...draft, brand: event.target.value })}
                />
              </label>
            </div>
            <div className="grid-2">
              <label>
                Amount
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={draft.amount}
                  onChange={(event) => setDraft({ ...draft, amount: event.target.value })}
                />
              </label>
              <label>
                Unit
                <select value={draft.unit} onChange={(event) => setDraft({ ...draft, unit: event.target.value })}>
                  {FOOD_UNITS.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Meal
              <select value={draft.slot} onChange={(event) => setDraft({ ...draft, slot: event.target.value })}>
                {MEAL_SLOTS.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </label>
            <div className="macro-inputs">
              {["kcal", "protein", "carbs", "fat"].map((key) => (
                <label key={key}>
                  {key}
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={draft[key]}
                    onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
                  />
                </label>
              ))}
            </div>
            <label>
              Notes
              <textarea
                rows="2"
                value={draft.notes}
                onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
                placeholder="How you’ll cook it, shop aisle, anything else"
              />
            </label>
            <button type="submit" className="btn">
              Add it
            </button>
          </form>
        ) : null}
      </section>

      <section className="panel">
        <header className="panel-head">
          <h2>On this day</h2>
        </header>
        {day.food.meals.length ? (
          MEAL_SLOTS.map((slot) => {
            const items = day.food.meals.filter((meal) => meal.slot === slot.id);
            if (!items.length) return null;
            return (
              <div key={slot.id} className="meal-slot">
                <h3>{slot.label}</h3>
                <ul className="meal-list">
                  {items.map((meal) => (
                    <li key={meal.id}>
                      <div>
                        <strong>{meal.name}</strong>
                        <span>
                          {[amountLine(meal), meal.brand, meal.kcal ? `${meal.kcal} kcal` : "", `P ${meal.protein || 0}`, `C ${meal.carbs || 0}`, `F ${meal.fat || 0}`, meal.actor === "nutritionist" ? "Nix" : ""]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                        {meal.notes ? <span>{meal.notes}</span> : null}
                      </div>
                      <button type="button" className="text-btn" onClick={() => removeMeal(meal.id)}>
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        ) : (
          <p className="muted">Blank. Hit Add food when you know what you’re cooking.</p>
        )}
      </section>

      <section className="panel">
        <header className="panel-head">
          <h2>Check-in</h2>
        </header>
        <label>
          Weigh-in (kg)
          <input
            type="number"
            step="0.1"
            value={day.food.weightKg}
            onChange={(event) => setWeighIn(event.target.value)}
          />
        </label>
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
        <label>
          Caleb note
          <textarea
            rows="2"
            value={day.food.athleteNote}
            onChange={(event) => day.setFood({ athleteNote: event.target.value })}
          />
        </label>
        <label>
          Nutritionist note
          <textarea
            className="coach-note"
            rows="3"
            value={day.food.nutritionistNote}
            onChange={(event) => day.setFood({ nutritionistNote: event.target.value })}
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
