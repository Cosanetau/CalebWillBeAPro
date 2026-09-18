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
