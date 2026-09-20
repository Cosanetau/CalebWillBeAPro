import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { fetchMe, loadState, saveState, signIn, signOut } from "./api.js";
import { emptyFoodDay, emptyState, emptyWorkoutDay } from "./state.js";
import { mondayOfWeek, localISODate, weekDatesContaining } from "./dates.js";
import { collectRestMap, restDatesInWeek, applyGameRest } from "./restDays.js";
import { planWeek } from "./program.js";
import { PERSIST_DEBOUNCE_MS, bumpPersistGen, isStaleSave, keepLocalState } from "./persistClient.js";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [auth, setAuth] = useState({ loading: true, ok: false, username: "", role: "caleb" });
  const [state, setState] = useState(emptyState());
  const [saveError, setSaveError] = useState("");
  const [savedAt, setSavedAt] = useState(null);
  const timer = useRef(null);
  const persistGen = useRef(0);

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
    persistGen.current = bumpPersistGen(persistGen.current);
    const gen = persistGen.current;
    timer.current = setTimeout(async () => {
      try {
        const saved = await saveState(next);
        if (isStaleSave(gen, persistGen.current)) return;
        setState((current) => keepLocalState(current, saved.state));
        setSavedAt(new Date());
        setSaveError(saved.warning || "");
      } catch (error) {
        if (isStaleSave(gen, persistGen.current)) return;
        setSaveError(error.message || "Could not save.");
      }
    }, PERSIST_DEBOUNCE_MS);
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

export function useWeek(isoDate = localISODate()) {
  const { state, patch } = useApp();
  const weekDates = weekDatesContaining(isoDate);
  const monday = mondayOfWeek(isoDate);
  const restMap = collectRestMap(state);
  const restDays = restDatesInWeek(weekDates, restMap);
  const plan = planWeek({ weekDates, restDays: restMap });
  const weekGames = weekDates.filter((date) => state.games[date]);

  function toggleRest(date) {
    if (state.games[date]) return;
    patch((current) => ({ ...current, ...applyGameRest(current, date, "rest", !restMap[date]) }));
  }

  function setRest(date, on) {
    patch((current) => {
      if (on && current.games?.[date]) return current;
      return { ...current, ...applyGameRest(current, date, "rest", on) };
    });
  }

  function setGameDay(date, on) {
    patch((current) => ({ ...current, ...applyGameRest(current, date, "game", on) }));
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
    setGameDay,
  };
}

export function useDay(isoDate) {
  const { state, patch, actor } = useApp();
  const food = state.foodLogs[isoDate] || emptyFoodDay();
  const workout = state.workoutLogs[isoDate] || emptyWorkoutDay();
  const game = state.games[isoDate] || null;

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
    else games[isoDate] = { time: "14:00", opponent: "", location: "", ...game, ...next };
    patch({ games });
  }

  return { food, workout, game, setFood, setWorkout, setGame };
}
