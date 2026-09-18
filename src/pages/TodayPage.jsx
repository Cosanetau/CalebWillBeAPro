import { Link } from "react-router-dom";
import { useDay, useWeek } from "../lib/useApp.jsx";
import { formatDate, localISODate } from "../lib/dates.js";
import { dayTypeLabel } from "../lib/program.js";
import { amountLine, MEAL_SLOTS, mealSlot } from "../lib/nutrition.js";

export default function TodayPage() {
  const today = localISODate();
  const week = useWeek(today);
  const day = useDay(today);
  const label = dayTypeLabel({
    isGame: Boolean(day.game),
    isRest: week.plan[today]?.sessionId === "rest",
  });

  return (
    <div className="stack">
      <section className="hero-card">
        <p className="kicker">Today · {formatDate(today)}</p>
        <h1>{label}</h1>
      </section>

      <section className="panel">
        <header className="panel-head">
          <h2>Eat this</h2>
        </header>
        {day.food.meals.length ? (
          MEAL_SLOTS.map((slot) => {
            const items = day.food.meals.filter((meal) => mealSlot(meal.slot) === slot.id);
            if (!items.length) return null;
            return (
              <div key={slot.id} className="meal-slot">
                <h3>{slot.label}</h3>
                <ul className="meal-list">
                  {items.map((meal) => (
                    <li key={meal.id}>
                      <div>
                        <strong>{meal.name}</strong>
                        <span>{[amountLine(meal), meal.brand].filter(Boolean).join(" · ")}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })
        ) : (
          <p className="muted">
            Nothing on today yet. Put food on the <Link to="/food">Food</Link> tab.
          </p>
        )}
      </section>
    </div>
  );
}
