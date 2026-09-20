import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { amountLine, isGroceryBought, sortShopList, toggleGroceryBought, weekBuyList } from "../lib/nutrition.js";
import { addDaysISO, localISODate, weekdayLabel } from "../lib/dates.js";
import { foodKind } from "../lib/program.js";
import { seesNutrition } from "../lib/accounts.js";
import { useApp, useWeek } from "../lib/useApp.jsx";

export default function GroceryPage() {
  const today = localISODate();
  const [selected, setSelected] = useState(today);
  const { state, auth, patch } = useApp();
  const showMacros = seesNutrition(auth.role);
  const week = useWeek(selected);
  const monday = week.monday;
  const shop = useMemo(() => {
    const list = weekBuyList(week.weekDates, state.foodLogs);
    return sortShopList(list, state.groceryBought, monday);
  }, [week.weekDates, state.foodLogs, state.groceryBought, monday]);

  function toggleItem(item) {
    patch((current) => ({
      ...current,
      groceryBought: toggleGroceryBought(current.groceryBought, monday, item),
    }));
  }

  return (
    <div className="stack">
      <section className="hero-card compact">
        <p className="kicker">Grocery · {auth.username}</p>
        <h1>Grocery</h1>
        <p className="lede">What to buy this week, from the food you dropped onto days. Tick it off in the aisle.</p>
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
            {shop.map((item) => {
              const bought = isGroceryBought(state.groceryBought, monday, item);
              return (
                <li key={`${item.name}-${item.unit}`} className={bought ? "is-bought" : ""}>
                  <label className="check">
                    <input type="checkbox" checked={bought} onChange={() => toggleItem(item)} />
                    <span>
                      <strong>{item.name}</strong>
                      <em>
                        {amountLine(item) || "as added"}
                        {showMacros && item.kcal ? ` · ${Math.round(item.kcal)} kcal` : ""}
                        {showMacros && item.sodium ? ` · Na ${Math.round(item.sodium)}` : ""}
                      </em>
                    </span>
                  </label>
                </li>
              );
            })}
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
