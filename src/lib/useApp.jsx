import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { fetchAuth, loadState, saveState, signOut, submitAccessWord } from "./api.js";
import { emptyFoodDay, emptyState, emptyWorkoutDay } from "./state.js";
import { mondayOfWeek, tokyoISODate, weekDatesContaining } from "./tokyo.js";
import { resolveRestDays } from "./restDays.js";
import { planWeek } from "./program.js";

const AppContext = createContext(null);
const ACTOR_KEY = "cwbp_actor";

export function AppProvider({ children }) {
  const [auth, setAuth] = useState({ loading: true, ok: false, needsSetup: false });
  const [state, setState] = useState(emptyState());
  const [actor, setActorState] = useState(() => localStorage.getItem(ACTOR_KEY) || "caleb");
  const [saveError, setSaveError] = useState("");
  const [savedAt, setSavedAt] = useState(null);
  const timer = useRef(null);

  const refreshAuth = useCallback(async () => {
    const next = await fetchAuth();
    setAuth({ loading: false, ok: next.ok, needsSetup: next.needsSetup });
    return next;
  }, []);

  useEffect(() => {
    refreshAuth()
      .then(async (next) => {
        if (next.ok) {
          setState(await loadState());
        }
      })
      .catch(() => setAuth({ loading: false, ok: false, needsSetup: false }));
  }, [refreshAuth]);

  const persist = useCallback((next) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const saved = await saveState(next);
        setState(saved);
        setSavedAt(new Date());
        setSaveError("");
      } catch (error) {
        setSaveError(error.message || "Could not save.");
      }
    }, 400);
  }, []);

  const patch = useCallback(
    (partial) => {
      setState((current) => {
        const next = typeof partial === "function" ? partial(current) : { ...current, ...partial };
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const unlock = useCallback(async (word) => {
    const result = await submitAccessWord(word);
    setAuth({ loading: false, ok: true, needsSetup: false });
    setState(await loadState());
    return result;
  }, []);

  const lock = useCallback(async () => {
    await signOut();
    setAuth({ loading: false, ok: false, needsSetup: false });
    setState(emptyState());
  }, []);

  const setActor = useCallback((value) => {
    localStorage.setItem(ACTOR_KEY, value);
    setActorState(value);
  }, []);

  const value = useMemo(
    () => ({
      auth,
      state,
      actor,
      setActor,
      patch,
      unlock,
      lock,
      saveError,
      savedAt,
      refreshAuth,
    }),
    [auth, state, actor, setActor, patch, unlock, lock, saveError, savedAt, refreshAuth]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp must be used inside AppProvider");
  return value;
}

export function useWeek(isoDate = tokyoISODate()) {
  const { state, patch } = useApp();
  const weekDates = weekDatesContaining(isoDate);
  const monday = mondayOfWeek(isoDate);
  const restDays = resolveRestDays(weekDates, state.games, state.restOverrides);
  const plan = planWeek({ weekDates, restDays, games: state.games });
  const weekGames = weekDates.filter((date) => state.games[date]);

  function setRestDays(nextRest) {
    patch({
      restOverrides: {
        ...state.restOverrides,
        [monday]: nextRest,
      },
    });
  }

  function clearRestOverride() {
    const restOverrides = { ...state.restOverrides };
    delete restOverrides[monday];
    patch({ restOverrides });
  }

  return {
    weekDates,
    monday,
    restDays,
    plan,
    weekGames,
    setRestDays,
    clearRestOverride,
    hasOverride: Boolean(state.restOverrides[monday]),
  };
}

export function useDay(isoDate) {
  const { state, patch, actor } = useApp();
  const food = state.foodLogs[isoDate] || emptyFoodDay();
  const workout = state.workoutLogs[isoDate] || emptyWorkoutDay();
  const game = state.games[isoDate] || null;
  const note = state.calendarNotes[isoDate] || "";

  function setFood(next) {
    patch({
      foodLogs: {
        ...state.foodLogs,
        [isoDate]: { ...food, ...next },
      },
    });
  }

  function setWorkout(next) {
    patch({
      workoutLogs: {
        ...state.workoutLogs,
        [isoDate]: { ...workout, ...next, actor },
      },
    });
  }

  function setGame(next) {
    const games = { ...state.games };
    if (!next) delete games[isoDate];
    else games[isoDate] = { time: "14:00", opponent: "", location: "", notes: "", ...game, ...next };
    patch({ games });
  }

  function setNote(value) {
    patch({
      calendarNotes: {
        ...state.calendarNotes,
        [isoDate]: value,
      },
    });
  }

  return { food, workout, game, note, setFood, setWorkout, setGame, setNote };
}
