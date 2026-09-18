import { useState } from "react";
import { Link } from "react-router-dom";
import { amountLine, weekBuyList } from "../lib/nutrition.js";
import { addDaysISO, localISODate, weekdayLabel } from "../lib/dates.js";
import { foodKind } from "../lib/program.js";
import { seesNutrition } from "../lib/accounts.js";
import { useApp, useWeek } from "../lib/useApp.jsx";

export default function GroceryPage() {
  const today = localISODate();
  const [selected, setSelected] = useState(today);
  const { state, auth } = useApp();
  const showMacros = seesNutrition(auth.role);
  const week = useWeek(selected);
  const shop = weekBuyList(week.weekDates, state.foodLogs);

  return (
    <div className="stack">
      <section className="hero-card compact">
        <p className="kicker">Grocery · {auth.username}</p>
        <h1>Grocery</h1>
        <p className="lede">What to buy this week, from the food you dropped onto days.</p>
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
          <p className="muted">
            Nothing to buy yet. Drop food onto days on the <Link to="/food">Food</Link> tab.
          </p>
        )}
      </section>
    </div>
  );
}
