export const DEFAULT_WEIGHT_KG = 82;

export const DAY_TYPE_TARGETS = {
  game: {
    label: "Game day",
    kcalPerKg: 48,
    proteinPerKg: 2.0,
    carbsPerKg: 7.5,
    fatPerKg: 1.0,
    waterL: 4.0,
    note: "Front-load carbs 3–4 hours before puck drop. Easy-to-digest, familiar food. Recovery meal within 60 minutes.",
  },
  train: {
    label: "Training day",
    kcalPerKg: 44,
    proteinPerKg: 2.0,
    carbsPerKg: 6.0,
    fatPerKg: 1.0,
    waterL: 3.6,
    note: "Carbs around the session. Protein at every meal. Salt food in heat and after ice.",
  },
  rest: {
    label: "Rest day",
    kcalPerKg: 36,
    proteinPerKg: 1.8,
    carbsPerKg: 3.5,
    fatPerKg: 1.1,
    waterL: 3.0,
    note: "Still eat enough. Drop some starch, keep protein and plants high, sleep like it is a session.",
  },
};

export function roundTo(value, step = 1) {
  return Math.round(value / step) * step;
}

export function targetsFor(dayType, weightKg = DEFAULT_WEIGHT_KG) {
  const spec = DAY_TYPE_TARGETS[dayType] || DAY_TYPE_TARGETS.train;
  const protein = roundTo(spec.proteinPerKg * weightKg);
  const carbs = roundTo(spec.carbsPerKg * weightKg);
  const fat = roundTo(spec.fatPerKg * weightKg, 1);
  const kcalFromMacros = protein * 4 + carbs * 4 + fat * 9;
  return {
    ...spec,
    weightKg,
    protein,
    carbs,
    fat,
    kcal: roundTo(Math.max(spec.kcalPerKg * weightKg, kcalFromMacros), 10),
    waterL: spec.waterL,
  };
}

export function mealTotals(meals = []) {
  return meals.reduce(
    (sum, meal) => ({
      kcal: sum.kcal + Number(meal.kcal || 0),
      protein: sum.protein + Number(meal.protein || 0),
      carbs: sum.carbs + Number(meal.carbs || 0),
      fat: sum.fat + Number(meal.fat || 0),
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

export function inForDayLine(value, goal, unit = "") {
  const eaten = Math.round(Number(value) || 0);
  const need = Math.round(Number(goal) || 0);
  return unit ? `${eaten} ${unit}/${need}` : `${eaten}/${need}`;
}

export function emptyNutritionTargets() {
  return { kcal: 3600, protein: 160, carbs: 490, fat: 80 };
}

export function resolveTargets(saved) {
  const defaults = emptyNutritionTargets();
  return {
    kcal: Number(saved?.kcal) > 0 ? Number(saved.kcal) : defaults.kcal,
    protein: Number(saved?.protein) > 0 ? Number(saved.protein) : defaults.protein,
    carbs: Number(saved?.carbs) > 0 ? Number(saved.carbs) : defaults.carbs,
    fat: Number(saved?.fat) > 0 ? Number(saved.fat) : defaults.fat,
  };
}

export function remaining(targets, totals) {
  return {
    kcal: roundTo(targets.kcal - totals.kcal, 1),
    protein: roundTo(targets.protein - totals.protein, 1),
    carbs: roundTo(targets.carbs - totals.carbs, 1),
    fat: roundTo(targets.fat - totals.fat, 1),
  };
}

export const MEAL_SLOTS = [
  { id: "breakfast", label: "Breakfast" },
  { id: "lunch", label: "Lunch" },
  { id: "dinner", label: "Dinner" },
  { id: "snack", label: "Snack" },
];

const KNOWN_SLOTS = new Set(MEAL_SLOTS.map((slot) => slot.id));

export function mealSlot(slot) {
  if (KNOWN_SLOTS.has(slot)) return slot;
  return "snack";
}

export const FOOD_UNITS = ["g", "kg", "ml", "L", "piece", "cup", "tbsp", "tsp", "pack"];

export function weekBuyList(weekDates, foodLogs = {}) {
  const map = new Map();
  for (const date of weekDates) {
    for (const meal of foodLogs[date]?.meals || []) {
      const parts =
        Array.isArray(meal.ingredients) && meal.ingredients.length ? meal.ingredients : [meal];
      for (const part of parts) {
        const name = String(part.name || "").trim();
        if (!name) continue;
        const unit = String(part.unit || "").trim();
        const key = `${name.toLowerCase()}|${unit.toLowerCase()}`;
        const current = map.get(key) || {
          name,
          unit,
          amount: 0,
          kcal: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          days: [],
        };
        current.amount += Number(part.amount || 0);
        current.kcal += Number(part.kcal || 0);
        current.protein += Number(part.protein || 0);
        current.carbs += Number(part.carbs || 0);
        current.fat += Number(part.fat || 0);
        if (!current.days.includes(date)) current.days.push(date);
        map.set(key, current);
      }
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export function amountLine(item) {
  const amount = Number(item.amount);
  if (!amount && !item.unit) return "";
  if (!amount) return item.unit || "";
  if (!item.unit) return String(amount);
  return `${amount} ${item.unit}`;
}

export function nutritionBits(item) {
  return [
    item.kcal ? `${item.kcal} kcal` : "",
    `P ${item.protein || 0}`,
    `C ${item.carbs || 0}`,
    `F ${item.fat || 0}`,
  ].filter(Boolean);
}

export function asRecipe(food) {
  if (!food) return { name: "", notes: "", ingredients: [] };
  if (Array.isArray(food.ingredients)) {
    return {
      id: food.id,
      name: String(food.name || "").trim(),
      notes: String(food.notes || "").trim(),
      ingredients: food.ingredients.map((ing) => ({
        id: ing.id,
        name: String(ing.name || "").trim(),
        amount: ing.amount ?? "",
        unit: ing.unit || "g",
        kcal: ing.kcal ?? "",
        protein: ing.protein ?? "",
        carbs: ing.carbs ?? "",
        fat: ing.fat ?? "",
      })),
    };
  }
  const leftoverName = String(food.brand || food.name || "").trim();
  return {
    id: food.id,
    name: String(food.name || "").trim(),
    notes: String(food.notes || "").trim(),
    ingredients: leftoverName
      ? [
          {
            id: `${food.id || "ing"}-1`,
            name: leftoverName,
            amount: food.amount ?? "",
            unit: food.unit || "g",
            kcal: food.kcal ?? "",
            protein: food.protein ?? "",
            carbs: food.carbs ?? "",
            fat: food.fat ?? "",
          },
        ]
      : [],
  };
}

export function recipeTotals(recipe) {
  return mealTotals(asRecipe(recipe).ingredients);
}

export function scaleRecipe(recipe, servings = 1) {
  const factor = Number(servings);
  const n = Number.isFinite(factor) && factor > 0 ? factor : 1;
  const scale = (value) => Math.round(Number(value || 0) * n * 10) / 10;
  const base = asRecipe(recipe);
  const ingredients = base.ingredients.map((ing) => ({
    ...ing,
    amount: scale(ing.amount),
    kcal: scale(ing.kcal),
    protein: scale(ing.protein),
    carbs: scale(ing.carbs),
    fat: scale(ing.fat),
  }));
  const totals = mealTotals(ingredients);
  return {
    foodId: base.id || "",
    name: base.name,
    notes: base.notes,
    servings: n,
    ingredients,
    ...totals,
  };
}

export function formatWeightKg(value) {
  if (value === "" || value == null) return "";
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return "";
  return `${n} kg`;
}

export const SUPPLEMENTS = [
  { id: "creatine", label: "Creatine 5g" },
  { id: "whey", label: "Whey / milk protein" },
  { id: "omega3", label: "Omega-3" },
  { id: "vitaminD", label: "Vitamin D" },
  { id: "electrolytes", label: "Electrolytes" },
];
