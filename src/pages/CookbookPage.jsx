import { useMemo, useState } from "react";
import {
  FOOD_UNITS,
  MACRO_KEYS,
  amountLine,
  asRecipe,
  nutritionBits,
  recipeTotals,
} from "../lib/nutrition.js";
import { emptyIngredient, emptyRecipe, newId } from "../lib/state.js";
import { useApp } from "../lib/useApp.jsx";

function blankDraft() {
  return { ...emptyRecipe(), ingredients: [{ ...emptyIngredient() }] };
}

export default function CookbookPage() {
  const { state, auth, patch } = useApp();
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [draft, setDraft] = useState(blankDraft());
  const recipes = useMemo(
    () =>
      [...(state.foods || [])]
        .map(asRecipe)
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" })),
    [state.foods]
  );

  function openNew() {
    setEditingId("");
    setDraft(blankDraft());
    setAdding(true);
  }

  function openEdit(recipe) {
    setEditingId(recipe.id);
    setDraft({
      name: recipe.name,
      notes: recipe.notes,
      ingredients: recipe.ingredients.length ? recipe.ingredients.map((ing) => ({ ...ing })) : [{ ...emptyIngredient() }],
    });
    setAdding(true);
  }

  function closeForm() {
    setAdding(false);
    setEditingId("");
    setDraft(blankDraft());
  }

  function setIngredient(index, next) {
    const ingredients = draft.ingredients.map((ing, i) => (i === index ? { ...ing, ...next } : ing));
    setDraft({ ...draft, ingredients });
  }

  function addIngredient() {
    setDraft({ ...draft, ingredients: [...draft.ingredients, { ...emptyIngredient() }] });
  }

  function removeIngredient(index) {
    const ingredients = draft.ingredients.filter((_, i) => i !== index);
    setDraft({ ...draft, ingredients: ingredients.length ? ingredients : [{ ...emptyIngredient() }] });
  }

  function saveRecipe(event) {
    event.preventDefault();
    if (!draft.name.trim()) return;
    const ingredients = draft.ingredients
      .filter((ing) => String(ing.name || "").trim())
      .map((ing) => ({
        id: ing.id || newId(),
        name: String(ing.name).trim(),
        amount: Number(ing.amount || 0),
        unit: ing.unit || "g",
        kcal: Number(ing.kcal || 0),
        protein: Number(ing.protein || 0),
        carbs: Number(ing.carbs || 0),
        fat: Number(ing.fat || 0),
        sodium: Number(ing.sodium || 0),
      }));
    if (!ingredients.length) return;
    const item = {
      id: editingId || newId(),
      name: draft.name.trim(),
      notes: draft.notes.trim(),
      ingredients,
    };
    const next = [...(state.foods || [])];
    const index = next.findIndex((food) => food.id === item.id);
    if (index >= 0) next[index] = item;
    else next.push(item);
    patch({ foods: next });
    closeForm();
  }

  function removeRecipe(id) {
    patch({ foods: (state.foods || []).filter((food) => food.id !== id) });
    if (editingId === id) closeForm();
  }

  const draftTotals = recipeTotals(draft);

  return (
    <div className="stack">
      <section className="hero-card compact">
        <p className="kicker">Cookbook · {auth.username}</p>
        <h1>The book</h1>
        <p className="lede">Add a food, then the ingredients in it, with kcal, protein, carbs, fat, and sodium. Food uses this list for the week.</p>
      </section>

      <section className="panel">
        <header className="panel-head">
          <h2>Recipes</h2>
          <button type="button" className="btn" onClick={() => (adding ? closeForm() : openNew())}>
            {adding ? "Close" : "Add food"}
          </button>
        </header>
        {recipes.length ? (
          <ul className="food-book">
            {recipes.map((recipe) => {
              const totals = recipeTotals(recipe);
              return (
                <li key={recipe.id}>
                  <div>
                    <strong>{recipe.name}</strong>
                    <span>
                      {recipe.ingredients.map((ing) => ing.name).filter(Boolean).join(", ") || "No ingredients"}
                    </span>
                    <span>{nutritionBits(totals).join(" · ")}</span>
                    {recipe.notes ? <span>{recipe.notes}</span> : null}
                  </div>
                  <div className="row-actions">
                    <button type="button" className="text-btn" onClick={() => openEdit(recipe)}>
                      Edit
                    </button>
                    <button type="button" className="text-btn" onClick={() => removeRecipe(recipe.id)}>
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="muted">Empty book. Add rice bowl, pasta, whatever you cook.</p>
        )}

        {adding ? (
          <form className="add-food-form" onSubmit={saveRecipe}>
            <h3>{editingId ? "Edit food" : "New food"}</h3>
            <label>
              Food name
              <input
                autoFocus
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                placeholder="Rice bowl, pasta, shake…"
              />
            </label>
            {draft.ingredients.map((ing, index) => (
              <div className="ingredient-card" key={ing.id || `new-${index}`}>
                <div className="ingredient-head">
                  <h3>Ingredient {index + 1}</h3>
                  <button type="button" className="text-btn" onClick={() => removeIngredient(index)}>
                    Remove
                  </button>
                </div>
                <label>
                  Name
                  <input
                    value={ing.name}
                    onChange={(event) => setIngredient(index, { name: event.target.value })}
                    placeholder="Chicken, rice, oil…"
                  />
                </label>
                <div className="grid-2">
                  <label>
                    Amount
                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      value={ing.amount}
                      onChange={(event) => setIngredient(index, { amount: event.target.value })}
                    />
                  </label>
                  <label>
                    Unit
                    <select value={ing.unit} onChange={(event) => setIngredient(index, { unit: event.target.value })}>
                      {FOOD_UNITS.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="macro-inputs">
                  {MACRO_KEYS.map((key) => (
                    <label key={key}>
                      {key === "sodium" ? "sodium (mg)" : key}
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={ing[key]}
                        onChange={(event) => setIngredient(index, { [key]: event.target.value })}
                      />
                    </label>
                  ))}
                </div>
                {amountLine(ing) ? <p className="muted">{amountLine(ing)}</p> : null}
              </div>
            ))}
            <button type="button" className="text-btn" onClick={addIngredient}>
              Add ingredient
            </button>
            <p className="muted">This food: {nutritionBits(draftTotals).join(" · ") || "no macros yet"}</p>
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
              {editingId ? "Save food" : "Add to cookbook"}
            </button>
          </form>
        ) : null}
      </section>
    </div>
  );
}
