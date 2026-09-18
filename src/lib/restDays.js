export function normalizeRestDays(restDays) {
  if (Array.isArray(restDays)) {
    return Object.fromEntries(restDays.filter(Boolean).map((date) => [date, true]));
  }
  if (restDays && typeof restDays === "object") return { ...restDays };
  return {};
}

export function collectRestMap(state = {}) {
  const map = normalizeRestDays(state.restDays);
  for (const value of Object.values(state.restOverrides || {})) {
    if (Array.isArray(value)) {
      for (const date of value) map[date] = true;
    }
  }
  return map;
}

export function isRestDay(isoDate, restDays) {
  return Boolean(normalizeRestDays(restDays)[isoDate]);
}

export function restDatesInWeek(weekDates, restDays) {
  const map = normalizeRestDays(restDays);
  return weekDates.filter((date) => map[date]);
}

export function applyGameRest(state, iso, which, on) {
  const games = { ...(state.games || {}) };
  const restDays = normalizeRestDays(state.restDays);
  const restOverrides = { ...(state.restOverrides || {}) };

  function clearRest() {
    delete restDays[iso];
    for (const key of Object.keys(restOverrides)) {
      if (Array.isArray(restOverrides[key])) {
        restOverrides[key] = restOverrides[key].filter((date) => date !== iso);
      }
    }
  }

  if (which === "game") {
    if (on) {
      games[iso] = { time: "14:00", opponent: "", location: "", notes: "", ...games[iso] };
      clearRest();
    } else {
      delete games[iso];
    }
  } else if (on) {
    if (games[iso]) return { games, restDays, restOverrides };
    restDays[iso] = true;
  } else {
    clearRest();
  }

  return { games, restDays, restOverrides };
}
