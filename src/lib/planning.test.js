import { describe, expect, it } from "vitest";
import { addDaysISO, mondayOfWeek, tokyoISODate, weekDatesContaining, weekdayIndexFromISO, weekdayLabel } from "./tokyo.js";
import { collectRestMap, isRestDay, restDatesInWeek } from "./restDays.js";
import { dayKind, foodKind, getSession, planWeek, sessionIdForWeekday } from "./program.js";
import { mealTotals, remaining, targetsFor } from "./nutrition.js";
import { rxLine, sessionItems } from "../data/sessions.js";
import { loginFieldError, roleForUsername, usernameToEmail } from "./accounts.js";

describe("tokyo week math", () => {
  it("treats Monday as the start of the training week", () => {
    expect(mondayOfWeek("2026-09-18")).toBe("2026-09-14");
    expect(weekdayLabel("2026-09-18")).toBe("Fri");
    expect(weekdayIndexFromISO("2026-09-20")).toBe(6);
    expect(weekDatesContaining("2026-09-18")).toEqual([
      "2026-09-14",
      "2026-09-15",
      "2026-09-16",
      "2026-09-17",
      "2026-09-18",
      "2026-09-19",
      "2026-09-20",
    ]);
    expect(addDaysISO("2026-09-20", 1)).toBe("2026-09-21");
  });

  it("formats a Tokyo civil date from a UTC instant", () => {
    expect(tokyoISODate(new Date("2026-09-17T16:00:00Z"))).toBe("2026-09-18");
  });
});

describe("rest days", () => {
  it("only rests when a day is marked", () => {
    expect(isRestDay("2026-09-16", {})).toBe(false);
    expect(isRestDay("2026-09-16", { "2026-09-16": true })).toBe(true);
    expect(restDatesInWeek(weekDatesContaining("2026-09-18"), { "2026-09-16": true })).toEqual([
      "2026-09-16",
    ]);
  });

  it("keeps old weekly rest lists", () => {
    const map = collectRestMap({
      restOverrides: { "2026-09-14": ["2026-09-15", "2026-09-18"] },
    });
    expect(map["2026-09-15"]).toBe(true);
    expect(map["2026-09-18"]).toBe(true);
  });
});

describe("week plan", () => {
  it("uses a set hockey session for each weekday unless rest is marked", () => {
    const weekDates = weekDatesContaining("2026-09-18");
    const plan = planWeek({ weekDates, restDays: { "2026-09-16": true } });

    expect(sessionIdForWeekday("2026-09-14")).toBe("mon-agility");
    expect(sessionIdForWeekday("2026-09-15")).toBe("tue-aerobic");
    expect(sessionIdForWeekday("2026-09-16")).toBe("wed-recovery");
    expect(plan["2026-09-14"].sessionId).toBe("mon-agility");
    expect(plan["2026-09-16"].sessionId).toBe("rest");
    expect(plan["2026-09-18"].sessionId).toBe("fri-intervals");
    expect(dayKind(plan["2026-09-16"].sessionId)).toBe("rest");
    expect(dayKind(plan["2026-09-14"].sessionId)).toBe("train");
    expect(foodKind({ isGame: true, isRest: false })).toBe("game");
    expect(foodKind({ isGame: false, isRest: true })).toBe("rest");
  });

  it("keeps the Monday hockey work as written", () => {
    const monday = getSession("mon-agility");
    const box = sessionItems(monday).find((item) => item.id === "box");
    expect(rxLine(box)).toBe("4 × 3");
    expect(monday.sections.map((block) => block.name).join(" ")).toMatch(/Agility/);
    expect(monday.sections.map((block) => block.name).join(" ")).toMatch(/Ankle/);
  });
});

describe("nutrition targets", () => {
  it("scales macros to body weight and day type", () => {
    const game = targetsFor("game", 80);
    const rest = targetsFor("rest", 80);
    expect(game.carbs).toBeGreaterThan(rest.carbs);
    expect(game.kcal).toBeGreaterThan(rest.kcal);

    const totals = mealTotals([
      { kcal: 600, protein: 40, carbs: 70, fat: 16 },
      { kcal: 400, protein: 30, carbs: 40, fat: 10 },
    ]);
    expect(totals.protein).toBe(70);
    expect(remaining(game, totals).protein).toBe(game.protein - 70);
  });
});

describe("login", () => {
  it("maps usernames to hidden login emails and roles", () => {
    expect(usernameToEmail("Nix")).toBe("nix@login.cwbp.cosa.net.au");
    expect(roleForUsername("Nix")).toBe("nutritionist");
    expect(roleForUsername("Caleb")).toBe("caleb");
    expect(loginFieldError({ username: "", password: "x" })).toMatch(/name/i);
    expect(loginFieldError({ username: "Nix", password: "" })).toMatch(/password/i);
    expect(loginFieldError({ username: "Sam", password: "secret" })).toMatch(/Caleb or Nix/i);
    expect(loginFieldError({ username: "Nix", password: "secret" })).toBe("");
  });
});
