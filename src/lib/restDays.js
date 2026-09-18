import { addDaysISO, daysBetween } from "./tokyo.js";

function unique(dates) {
  return [...new Set(dates)];
}

function closestGamePair(gameDates) {
  if (gameDates.length < 2) return gameDates.slice();

  let best = [gameDates[0], gameDates[1]];
  let bestGap = Infinity;

  for (let i = 0; i < gameDates.length; i += 1) {
    for (let j = i + 1; j < gameDates.length; j += 1) {
      const gap = Math.abs(daysBetween(gameDates[i], gameDates[j]));
      if (gap < bestGap) {
        bestGap = gap;
        best = [gameDates[i], gameDates[j]];
      }
    }
  }

  return best.sort();
}

export function gamesInWeek(weekDates, games) {
  const gameDates = Object.keys(games || {});
  return weekDates.filter((date) => gameDates.includes(date)).sort();
}

/**
 * Two rest-from-gym days, derived from that week's games — never a fixed weekday.
 *
 * - 2+ games: the two closest game days (back-to-backs win)
 * - 1 game: game day + the next day if it is still in the week
 * - 0 games: no suggestion; the week must pick rest days by hand
 */
export function suggestRestDays(weekDates, games) {
  const weekGames = gamesInWeek(weekDates, games);

  if (weekGames.length >= 2) {
    return closestGamePair(weekGames);
  }

  if (weekGames.length === 1) {
    const gameDay = weekGames[0];
    const nextDay = addDaysISO(gameDay, 1);
    if (weekDates.includes(nextDay)) {
      return [gameDay, nextDay];
    }
    return [gameDay];
  }

  return [];
}

export function resolveRestDays(weekDates, games, restOverrides = {}) {
  const monday = weekDates[0];
  const override = restOverrides[monday];
  if (Array.isArray(override) && override.length) {
    return unique(override.filter((date) => weekDates.includes(date))).sort();
  }
  return suggestRestDays(weekDates, games);
}

export function restStatus(weekDates, restDays) {
  const valid = restDays.filter((date) => weekDates.includes(date));
  if (valid.length === 2) {
    return { ok: true, needed: 0, restDays: valid.sort() };
  }
  return {
    ok: false,
    needed: Math.max(0, 2 - valid.length),
    restDays: valid.sort(),
  };
}

export function isRestDay(isoDate, restDays) {
  return restDays.includes(isoDate);
}
