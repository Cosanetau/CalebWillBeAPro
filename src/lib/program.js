import { weekdayIndexFromISO } from "./tokyo.js";
import { sessions, WEEKDAY_SESSION_IDS } from "../data/sessions.js";
import { isRestDay } from "./restDays.js";

export function getSession(sessionId) {
  return sessions[sessionId] || sessions.rest;
}

export function sessionIdForWeekday(isoDate) {
  return WEEKDAY_SESSION_IDS[weekdayIndexFromISO(isoDate)];
}

export function sessionForDate(isoDate, restDays) {
  if (isRestDay(isoDate, restDays)) return getSession("rest");
  return getSession(sessionIdForWeekday(isoDate));
}

export function planWeek({ weekDates, restDays }) {
  const plan = {};
  for (const date of weekDates) {
    const session = sessionForDate(date, restDays);
    plan[date] = {
      sessionId: session.id,
      reason: session.id === "rest" ? "Marked rest. No gym." : `${session.weekday} is ${session.title.toLowerCase()}.`,
    };
  }
  return plan;
}

export function dayKind(sessionId) {
  if (sessionId === "rest") return "rest";
  return "train";
}

export function foodKind({ isGame, isRest }) {
  if (isGame) return "game";
  if (isRest) return "rest";
  return "train";
}

export function calendarKind({ isGame, isRest }) {
  if (isGame) return "game";
  if (isRest) return "rest";
  return "train";
}
