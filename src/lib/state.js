export function emptyState() {
  return {
    rev: 1,
    profile: {
      athlete: "Caleb",
      weightKg: 82,
      heightCm: "",
      team: "",
      notes: "Ice hockey. Train for explosiveness, cardio, recoverability, and strength.",
    },
    games: {},
    restDays: {},
    restOverrides: {},
    workoutLogs: {},
    foodLogs: {},
    foods: [],
    nutritionTargets: {
      kcal: 3600,
      protein: 160,
      carbs: 490,
      fat: 80,
      sodium: 2300,
    },
    calendarNotes: {},
    extraEvents: [],
  };
}

export function newId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function emptyIngredient() {
  return {
    name: "",
    amount: "",
    unit: "g",
    kcal: "",
    protein: "",
    carbs: "",
    fat: "",
    sodium: "",
  };
}

export function emptyRecipe() {
  return {
    name: "",
    notes: "",
    ingredients: [emptyIngredient()],
  };
}

export function emptyFoodDay() {
  return {
    meals: [],
    waterL: 0,
    supplements: {},
    weightKg: "",
    nutritionistNote: "",
    athleteNote: "",
    hunger: "",
    energy: "",
  };
}

export function emptyWorkoutDay() {
  return {
    sessionId: "",
    completed: {},
    rpe: "",
    notes: "",
    actor: "",
  };
}
