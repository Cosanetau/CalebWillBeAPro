import { addDaysISO, daysBetween } from "./tokyo.js";
import { sessions } from "../data/sessions.js";

export const PILLARS = [
  {
    id: "explosiveness",
    label: "Explosiveness",
    blurb: "First-step, stride power, jumps, and alactic speed.",
  },
  {
    id: "cardio",
    label: "Cardio",
    blurb: "Repeat-sprint engine and aerobic base for Japan league minutes.",
  },
  {
    id: "recoverability",
    label: "Recoverability",
    blurb: "Tissue quality, easy aerobic, sleep, and bounce-back.",
  },
  {
    id: "strength",
    label: "Strength",
    blurb: "Posterior chain, single-leg, and battle robustness.",
  },
];

const FILL_ORDER = ["power-lower", "upper-battle", "rsa", "aerobic", "reset"];

function nearestGameDistance(isoDate, gameDates) {
  if (!gameDates.length) return 99;
  return Math.min(...gameDates.map((game) => Math.abs(daysBetween(isoDate, game))));
}

export function getSession(sessionId) {
  return sessions[sessionId] || sessions.rest;
}

export function planWeek({ weekDates, restDays, games }) {
  const rest = new Set(restDays);
  const gameDates = Object.keys(games || {}).filter((date) => weekDates.includes(date));
  const gameSet = new Set(gameDates);
  const plan = {};
  const used = new Set();

  function assign(date, sessionId, reason) {
    plan[date] = { sessionId, reason };
    if (!["game-activation", "game-rest", "rest"].includes(sessionId)) {
      used.add(sessionId);
    }
  }

  for (const date of weekDates) {
    const isGame = gameSet.has(date);
    const afterGame = gameSet.has(addDaysISO(date, -1));
    const beforeGame = gameSet.has(addDaysISO(date, 1));

    if (rest.has(date)) {
      assign(
        date,
        isGame ? "game-rest" : "rest",
        isGame
          ? "Rest from gym — this is a game day this week."
          : "Rest day taken from this week’s game schedule."
      );
      continue;
    }

    if (isGame) {
      assign(date, "game-activation", "Extra game day — activation only, no lift.");
      continue;
    }

    if (afterGame) {
      assign(date, "reset", "Day after a game — recoverability.");
      continue;
    }

    if (beforeGame) {
      assign(date, "aerobic", "Day before a game — aerobic engine, stay fresh.");
      continue;
    }
  }

  const openDays = weekDates.filter((date) => !plan[date]);
  openDays.sort(
    (a, b) => nearestGameDistance(b, gameDates) - nearestGameDistance(a, gameDates)
  );

  const remaining = FILL_ORDER.filter((id) => !used.has(id));
  openDays.forEach((date, index) => {
    const sessionId = remaining[index] || "reset";
    const session = getSession(sessionId);
    assign(date, sessionId, `Training day — ${session.title}.`);
  });

  return plan;
}

export function dayKind(sessionId) {
  if (sessionId === "game-rest" || sessionId === "game-activation") return "game";
  if (sessionId === "rest") return "rest";
  return "train";
}

export function pillarsCovered(plan) {
  const covered = new Set();
  for (const day of Object.values(plan)) {
    const session = getSession(day.sessionId);
    for (const pillar of session.pillars || []) covered.add(pillar);
  }
  return PILLARS.map((pillar) => ({
    ...pillar,
    covered: covered.has(pillar.id),
  }));
}
