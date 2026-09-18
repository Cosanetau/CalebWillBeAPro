export function emptyState() {
  return {
    rev: 1,
    accessWordHash: "",
    sessions: [],
    profile: {
      athlete: "Caleb",
      weightKg: 82,
      heightCm: "",
      team: "",
      notes: "Ice hockey in Japan. Train for explosiveness, cardio, recoverability, and strength.",
    },
    games: {},
    restOverrides: {},
    workoutLogs: {},
    foodLogs: {},
    calendarNotes: {},
    extraEvents: [],
  };
}

export function newId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`;
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
