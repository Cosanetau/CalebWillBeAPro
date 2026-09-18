import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { seedAccounts, signIn, signOut } from "./api.js";
import { loadProfile, loadState, saveState } from "./data.js";
import { emptyFoodDay, emptyState, emptyWorkoutDay } from "./state.js";
import { mondayOfWeek, tokyoISODate, weekDatesContaining } from "./tokyo.js";
import { resolveRestDays } from "./restDays.js";
import { planWeek } from "./program.js";
import { supabase } from "./supabase.js";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [auth, setAuth] = useState({ loading: true, ok: false, username: "", role: "caleb" });
  const [state, setState] = useState(emptyState());
  const [saveError, setSaveError] = useState("");
  const [savedAt, setSavedAt] = useState(null);
  const timer = useRef(null);

  const hydrate = useCallback(async (session) => {
    if (!session) {
      setAuth({ loading: false, ok: false, username: "", role: "caleb" });
      setState(emptyState());
      return;
    }
    const profile = await loadProfile();
    setAuth({
      loading: false,
      ok: true,
      username: profile?.username || "Caleb",
      role: profile?.role || "caleb",
    });
    try {
      setState(await loadState());
    } catch (error) {
      setSaveError(error.message || "Could not load shared data.");
      setState(emptyState());
    }
  }, []);

  useEffect(() => {
    seedAccounts();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      hydrate(session).catch((error) => {
        setSaveError(error.message || "Could not load.");
        setAuth({ loading: false, ok: false, username: "", role: "caleb" });
      });
    });

    supabase.auth.getSession().then(({ data: sessionData }) => hydrate(sessionData.session));

    return () => data.subscription.unsubscribe();
  }, [hydrate]);

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

  const login = useCallback(async (username, password) => {
    await signIn(username, password);
  }, []);

  const lock = useCallback(async () => {
    await signOut();
    setAuth({ loading: false, ok: false, username: "", role: "caleb" });
    setState(emptyState());
  }, []);

  const actor = auth.role === "nutritionist" ? "nutritionist" : "caleb";

  const value = useMemo(
    () => ({
      auth,
      state,
      actor,
      patch,
      login,
      lock,
      saveError,
      savedAt,
    }),
    [auth, state, actor, patch, login, lock, saveError, savedAt]
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
