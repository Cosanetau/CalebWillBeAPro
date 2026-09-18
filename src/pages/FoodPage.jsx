import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  MEAL_SLOTS,
  amountLine,
  asRecipe,
  mealTotals,
  remaining,
  resolveTargets,
  scaleRecipe,
  nutritionBits,
} from "../lib/nutrition.js";
import { foodKind } from "../lib/program.js";
import { addDaysISO, formatDate, localISODate, weekdayLabel } from "../lib/dates.js";
import { newId } from "../lib/state.js";
import { seesNutrition } from "../lib/accounts.js";
import { useApp, useDay, useWeek } from "../lib/useApp.jsx";

export default function FoodPage() {
  const today = localISODate();
  const [selected, setSelected] = useState(today);
  const [pick, setPick] = useState({ foodId: "", servings: "1", slot: "dinner" });
  const { state, actor, auth, patch } = useApp();
  const showMacros = seesNutrition(auth.role);
  const week = useWeek(selected);
  const day = useDay(selected);
  const targets = resolveTargets(state.nutritionTargets);
  const totals = mealTotals(day.food.meals);
  const left = remaining(targets, totals);
  const recipes = useMemo(
    () =>
      [...(state.foods || [])]
        .map(asRecipe)
        .filter((recipe) => recipe.name)
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })),
    [state.foods]
  );

  function putOnDay(event) {
    event.preventDefault();
    const recipe = recipes.find((item) => item.id === pick.foodId);
    if (!recipe) return;
    const scaled = scaleRecipe(recipe, pick.servings);
    if (!scaled.name) return;
    day.setFood({
      meals: [
        ...day.food.meals,
        {
          id: newId(),
          slot: pick.slot,
          actor,
          ...scaled,
        },
      ],
    });
    setPick({ ...pick, servings: "1" });
  }

  function removeMeal(id) {
    day.setFood({ meals: day.food.meals.filter((meal) => meal.id !== id) });
  }

  function setRequired(key, value) {
    patch({
      nutritionTargets: {
        ...targets,
        [key]: value,
      },
    });
  }

  return (
    <div className="stack">
      <section className="hero-card compact">
        <p className="kicker">Food · {auth.username}</p>
        <h1>Food</h1>
        <p className="lede">Pick a day and drop cookbook food onto it.</p>
      </section>

      <div className="week-shift">
        <button type="button" className="text-btn" onClick={() => setSelected(addDaysISO(selected, -7))}>
          Last week
        </button>
        <button type="button" className="text-btn" onClick={() => setSelected(addDaysISO(selected, 7))}>
          Next week
        </button>
      </div>
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
        </header>
        {showMacros ? (
          <div className="macro-row large">
            <Macro label="kcal" value={totals.kcal} goal={targets.kcal} left={left.kcal} />
            <Macro label="Protein" value={totals.protein} goal={targets.protein} left={left.protein} />
            <Macro label="Carbs" value={totals.carbs} goal={targets.carbs} left={left.carbs} />
            <Macro label="Fat" value={totals.fat} goal={targets.fat} left={left.fat} />
          </div>
        ) : null}

        {recipes.length ? (
          <form className="put-form" onSubmit={putOnDay}>
            <h3>Put on this day</h3>
            <div className="grid-2">
              <label>
                From the cookbook
                <select value={pick.foodId} onChange={(event) => setPick({ ...pick, foodId: event.target.value })}>
                  <option value="">Pick a food</option>
                  {recipes.map((recipe) => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Servings
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={pick.servings}
                  onChange={(event) => setPick({ ...pick, servings: event.target.value })}
                />
              </label>
            </div>
            <label>
              Meal
              <select value={pick.slot} onChange={(event) => setPick({ ...pick, slot: event.target.value })}>
                {MEAL_SLOTS.map((slot) => (
                  <option key={slot.id} value={slot.id}>
                    {slot.label}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="btn" disabled={!pick.foodId}>
              Put on {weekdayLabel(selected)}
            </button>
          </form>
        ) : (
          <p className="muted">
            Add foods on the <Link to="/cookbook">Cookbook</Link> tab, then pick them onto this day.
          </p>
        )}
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
                          {[
                            meal.servings && meal.servings !== 1 ? `${meal.servings} servings` : "",
                            ...(showMacros ? nutritionBits(meal) : []),
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                        {meal.ingredients?.length ? (
                          <span>
                            {meal.ingredients
                              .map((ing) => [ing.name, amountLine(ing)].filter(Boolean).join(" "))
                              .join(" · ")}
                          </span>
                        ) : null}
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
          <p className="muted">Blank. Pick from the cookbook when you know what you’re cooking.</p>
        )}
      </section>

      <section className="panel">
        <header className="panel-head">
          <h2>Required</h2>
        </header>
        <p className="muted">Not for every day. Change this when the plan changes.</p>
        <div className="macro-inputs required-inputs">
          {["kcal", "protein", "carbs", "fat"].map((key) => (
            <label key={key}>
              {key}
              <input
                type="number"
                min="0"
                step="1"
                value={state.nutritionTargets?.[key] ?? targets[key]}
                onChange={(event) => setRequired(key, event.target.value)}
              />
            </label>
          ))}
        </div>
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
