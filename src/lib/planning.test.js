import { describe, expect, it } from "vitest";
import { addDaysISO, mondayOfWeek, tokyoISODate, weekDatesContaining, weekdayIndexFromISO, weekdayLabel } from "./tokyo.js";
import { resolveRestDays, restStatus, suggestRestDays } from "./restDays.js";
import { dayKind, planWeek, pillarsCovered } from "./program.js";
import { mealTotals, remaining, targetsFor } from "./nutrition.js";
import { accessWordError } from "./access.js";

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

describe("rest days from games", () => {
  const week = weekDatesContaining("2026-09-18");

  it("does not invent a fixed weekday when there are no games", () => {
    expect(suggestRestDays(week, {})).toEqual([]);
    expect(restStatus(week, []).ok).toBe(false);
  });

  it("uses the game day plus the next day for a single game", () => {
    expect(suggestRestDays(week, { "2026-09-16": { opponent: "Home" } })).toEqual([
      "2026-09-16",
      "2026-09-17",
    ]);
  });

  it("uses the two closest game days, including back-to-backs", () => {
    const games = {
      "2026-09-14": {},
      "2026-09-19": {},
      "2026-09-20": {},
    };
    expect(suggestRestDays(week, games)).toEqual(["2026-09-19", "2026-09-20"]);
  });

  it("lets a manual override replace the suggestion for that week only", () => {
    const games = { "2026-09-19": {}, "2026-09-20": {} };
    const rest = resolveRestDays(week, games, {
      "2026-09-14": ["2026-09-15", "2026-09-18"],
    });
    expect(rest).toEqual(["2026-09-15", "2026-09-18"]);
  });
});

describe("week plan", () => {
  it("places recoverability after a game and keeps two rest days from games", () => {
    const weekDates = weekDatesContaining("2026-09-18");
    const games = { "2026-09-16": { time: "14:00" } };
    const restDays = suggestRestDays(weekDates, games);
    const plan = planWeek({ weekDates, restDays, games });

    expect(restDays).toEqual(["2026-09-16", "2026-09-17"]);
    expect(plan["2026-09-16"].sessionId).toBe("game-rest");
    expect(plan["2026-09-17"].sessionId).toBe("rest");
    expect(dayKind(plan["2026-09-16"].sessionId)).toBe("game");
    expect(dayKind(plan["2026-09-17"].sessionId)).toBe("rest");

    const trainDays = weekDates.filter((date) => !restDays.includes(date));
    expect(trainDays).toHaveLength(5);
    expect(pillarsCovered(plan).every((pillar) => pillar.covered)).toBe(true);
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

describe("access word", () => {
  it("rejects empty or spaced words", () => {
    expect(accessWordError("")).toMatch(/shared access word/i);
    expect(accessWordError("too open", { creating: true })).toMatch(/one word/i);
    expect(accessWordError("pro", { creating: true })).toMatch(/4/);
    expect(accessWordError("willbeapro", { creating: true })).toBe("");
  });
});
