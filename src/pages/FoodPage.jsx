import { useMemo, useState } from "react";
import {
  FOOD_UNITS,
  MEAL_SLOTS,
  amountLine,
  mealTotals,
  remaining,
  resolveTargets,
  scaleCatalogFood,
  weekBuyList,
  nutritionBits,
} from "../lib/nutrition.js";
import { foodKind } from "../lib/program.js";
import { addDaysISO, formatDate, localISODate, weekdayLabel } from "../lib/dates.js";
import { emptyCatalogFood, newId } from "../lib/state.js";
import { seesNutrition } from "../lib/accounts.js";
import { useApp, useDay, useWeek } from "../lib/useApp.jsx";

export default function FoodPage() {
  const today = localISODate();
  const [selected, setSelected] = useState(today);
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [draft, setDraft] = useState(emptyCatalogFood());
  const [pick, setPick] = useState({ foodId: "", servings: "1", slot: "dinner" });
  const { state, actor, auth, patch } = useApp();
  const showMacros = seesNutrition(auth.role);
  const week = useWeek(selected);
  const day = useDay(selected);
  const targets = resolveTargets(state.nutritionTargets);
  const totals = mealTotals(day.food.meals);
  const left = remaining(targets, totals);
  const shop = weekBuyList(week.weekDates, state.foodLogs);
  const foods = useMemo(
    () =>
      [...(state.foods || [])].sort((a, b) =>
        String(a.name || "").localeCompare(String(b.name || ""), undefined, { sensitivity: "base" })
      ),
    [state.foods]
  );

  function openNewFood() {
    setEditingId("");
    setDraft(emptyCatalogFood());
    setAdding(true);
  }

  function openEditFood(food) {
    setEditingId(food.id);
    setDraft({
      name: food.name || "",
      brand: food.brand || "",
      amount: food.amount ?? "",
      unit: food.unit || "g",
      kcal: food.kcal ?? "",
      protein: food.protein ?? "",
      carbs: food.carbs ?? "",
      fat: food.fat ?? "",
      notes: food.notes || "",
    });
    setAdding(true);
  }

  function closeForm() {
    setAdding(false);
    setEditingId("");
    setDraft(emptyCatalogFood());
  }

  function saveFood(event) {
    event.preventDefault();
    if (!draft.name.trim()) return;
    const existing = editingId ? (state.foods || []).find((food) => food.id === editingId) : null;
    const item = {
      id: editingId || newId(),
      name: draft.name.trim(),
      brand: draft.brand.trim(),
      amount: Number(draft.amount || 0),
      unit: draft.unit,
      kcal: showMacros ? Number(draft.kcal || 0) : Number(existing?.kcal || 0),
      protein: showMacros ? Number(draft.protein || 0) : Number(existing?.protein || 0),
      carbs: showMacros ? Number(draft.carbs || 0) : Number(existing?.carbs || 0),
      fat: showMacros ? Number(draft.fat || 0) : Number(existing?.fat || 0),
      notes: draft.notes.trim(),
    };
    const next = [...(state.foods || [])];
    const index = next.findIndex((food) => food.id === item.id);
    if (index >= 0) next[index] = item;
    else next.push(item);
    patch({ foods: next });
    if (!pick.foodId) setPick({ ...pick, foodId: item.id });
    closeForm();
  }

  function removeFood(id) {
    patch({ foods: (state.foods || []).filter((food) => food.id !== id) });
    if (pick.foodId === id) setPick({ ...pick, foodId: "" });
    if (editingId === id) closeForm();
  }

  function putOnDay(event) {
    event.preventDefault();
    const food = (state.foods || []).find((item) => item.id === pick.foodId);
    if (!food) return;
    const scaled = scaleCatalogFood(food, pick.servings);
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
        <h1>The kitchen</h1>
        <p className="lede">
          Keep a food book you can edit. Pick from it onto whatever day you’re cooking. The shop list fills itself for the week.
          {showMacros ? " You can see calories, protein, carbs, and fat." : ""}
        </p>
      </section>

      <section className="panel">
        <header className="panel-head">
          <h2>Food book</h2>
          <button type="button" className="btn" onClick={() => (adding ? closeForm() : openNewFood())}>
            {adding ? "Close" : "Add food"}
          </button>
        </header>
        <p className="muted">This is the list you reuse. Change a food here; days already cooked stay as you logged them.</p>
        {foods.length ? (
          <ul className="food-book">
            {foods.map((food) => (
              <li key={food.id}>
                <div>
                  <strong>{food.name}</strong>
                  <span>
                    {[amountLine(food) && `per ${amountLine(food)}`, food.brand, ...(showMacros ? nutritionBits(food) : [])]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                  {food.notes ? <span>{food.notes}</span> : null}
                </div>
                <div className="row-actions">
                  <button type="button" className="text-btn" onClick={() => openEditFood(food)}>
                    Edit
                  </button>
                  <button type="button" className="text-btn" onClick={() => removeFood(food.id)}>
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Empty book. Add chicken, rice, whatever you actually eat.</p>
        )}
        {adding ? (
          <form className="add-food-form" onSubmit={saveFood}>
            <h3>{editingId ? "Edit food" : "New food"}</h3>
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
                Brand / pack
                <input
                  value={draft.brand}
                  onChange={(event) => setDraft({ ...draft, brand: event.target.value })}
                />
              </label>
            </div>
            <div className="grid-2">
              <label>
                Amount per serving
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
            {showMacros ? (
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
            ) : null}
            <label>
              Notes
              <textarea
                rows="2"
                value={draft.notes}
                onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
                placeholder="How you cook it, shop aisle, anything else"
              />
            </label>
            <button type="submit" className="btn">
              {editingId ? "Save food" : "Add to book"}
            </button>
          </form>
        ) : null}
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
                  {showMacros && item.kcal ? ` · ${Math.round(item.kcal)} kcal` : ""}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="muted">Nothing to buy yet. Put food on days and it shows up here.</p>
        )}
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

        {foods.length ? (
          <form className="put-form" onSubmit={putOnDay}>
            <h3>Put on this day</h3>
            <div className="grid-2">
              <label>
                Food
                <select
                  value={pick.foodId}
                  onChange={(event) => setPick({ ...pick, foodId: event.target.value })}
                >
                  <option value="">Pick from the book</option>
                  {foods.map((food) => (
                    <option key={food.id} value={food.id}>
                      {food.name}
                      {food.brand ? ` (${food.brand})` : ""}
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
          <p className="muted">Add foods to the book first, then pick them onto this day.</p>
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
                            amountLine(meal),
                            meal.brand,
                            ...(showMacros ? nutritionBits(meal) : []),
                            meal.actor === "nutritionist" ? "Nix" : "",
                          ]
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
          <p className="muted">Blank. Pick from the book when you know what you’re cooking.</p>
        )}
      </section>

      <section className="panel">
        <header className="panel-head">
          <h2>Required</h2>
        </header>
        <p className="muted">Not for every day. Change this when the plan changes.</p>
        <div className="macro-inputs required-inputs">
          {[
            ["kcal", "kcal"],
            ["protein", "protein"],
            ["carbs", "carbs"],
            ["fat", "fat"],
          ].map(([key, label]) => (
            <label key={key}>
              {label}
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
