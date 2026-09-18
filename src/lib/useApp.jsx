import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { fetchMe, loadState, saveState, signIn, signOut } from "./api.js";
import { emptyFoodDay, emptyState, emptyWorkoutDay } from "./state.js";
import { mondayOfWeek, tokyoISODate, weekDatesContaining } from "./tokyo.js";
import { collectRestMap, restDatesInWeek } from "./restDays.js";
import { planWeek } from "./program.js";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [auth, setAuth] = useState({ loading: true, ok: false, username: "", role: "caleb" });
  const [state, setState] = useState(emptyState());
  const [saveError, setSaveError] = useState("");
  const [savedAt, setSavedAt] = useState(null);
  const timer = useRef(null);

  const hydrate = useCallback(async () => {
    try {
      const me = await fetchMe();
      if (!me.ok) {
        setAuth({ loading: false, ok: false, username: "", role: "caleb" });
        setState(emptyState());
        return;
      }
      setAuth({
        loading: false,
        ok: true,
        username: me.user.username,
        role: me.user.role,
      });
      try {
        const loaded = await loadState();
        setState(loaded.state);
        setSaveError(loaded.warning || "");
      } catch (error) {
        setState(emptyState());
        setSaveError(error.message || "Could not open the book.");
      }
    } catch {
      setAuth({ loading: false, ok: false, username: "", role: "caleb" });
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const persist = useCallback((next) => {
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        const saved = await saveState(next);
        setState(saved.state);
        setSavedAt(new Date());
        setSaveError(saved.warning || "");
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
    const result = await signIn(username, password);
    setAuth({
      loading: false,
      ok: true,
      username: result.user.username,
      role: result.user.role,
    });
    try {
      const loaded = await loadState();
      setState(loaded.state);
      setSaveError(loaded.warning || "");
    } catch (error) {
      setState(emptyState());
      setSaveError(error.message || "Could not open the book.");
    }
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
  const restMap = collectRestMap(state);
  const restDays = restDatesInWeek(weekDates, restMap);
  const plan = planWeek({ weekDates, restDays: restMap });
  const weekGames = weekDates.filter((date) => state.games[date]);

  function toggleRest(date) {
    const restDays = { ...restMap };
    if (restDays[date]) delete restDays[date];
    else restDays[date] = true;
    patch({ restDays });
  }

  function setRest(date, on) {
    const restDays = { ...restMap };
    if (on) restDays[date] = true;
    else delete restDays[date];
    patch({ restDays });
  }

  return {
    weekDates,
    monday,
    restDays,
    restMap,
    plan,
    weekGames,
    toggleRest,
    setRest,
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
