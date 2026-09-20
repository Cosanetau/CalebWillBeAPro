import { describe, expect, it } from "vitest";
import { addDaysISO, mondayOfWeek, localISODate, localParts, weekDatesContaining, weekdayIndexFromISO, weekdayLabel } from "./dates.js";
import { collectRestMap, isRestDay, restDatesInWeek, applyGameRest } from "./restDays.js";
import { dayKind, dayTypeLabel, foodKind, getSession, planWeek, sessionForDate, sessionIdForWeekday } from "./program.js";
import { formatWeightKg, mealSlot, mealTotals, remaining, resolveTargets, scaleRecipe, weekBuyList, nutritionBits, MEAL_SLOTS, inForDayLine } from "./nutrition.js";
import { rxLine, sessionItems } from "../data/sessions.js";
import { loginFieldError, roleForUsername, seesNutrition, usernameToEmail } from "./accounts.js";

describe("week math", () => {
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

  it("uses the local civil date", () => {
    const instant = new Date("2026-09-17T12:00:00Z");
    const parts = localParts(instant);
    const pad = (value) => String(value).padStart(2, "0");
    expect(localISODate(instant)).toBe(`${parts.year}-${pad(parts.month)}-${pad(parts.day)}`);
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

  it("will not mark rest on a game day, and game clears rest", () => {
    const playing = applyGameRest({ games: {}, restDays: { "2026-09-18": true } }, "2026-09-18", "game", true);
    expect(playing.games["2026-09-18"]).toBeTruthy();
    expect(playing.restDays["2026-09-18"]).toBeUndefined();
    const blocked = applyGameRest(playing, "2026-09-18", "rest", true);
    expect(blocked.games["2026-09-18"]).toBeTruthy();
    expect(blocked.restDays["2026-09-18"]).toBeUndefined();
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
    expect(dayTypeLabel({ isGame: true, isRest: false })).toBe("Game day");
    expect(dayTypeLabel({ isGame: false, isRest: true })).toBe("Rest day");
    expect(dayTypeLabel({ isGame: false, isRest: false })).toBe("Gym day");
    expect(sessionForDate("2026-09-18", {}, { "2026-09-18": { time: "14:00" } }).id).toBe("game");
    expect(sessionForDate("2026-09-18", {}, { "2026-09-18": { time: "14:00" } }).title).toMatch(/Game/);
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
  it("keeps required kcal, protein, carbs, fat, and sodium until they are changed", () => {
    expect(resolveTargets(undefined)).toMatchObject({ kcal: 3600, protein: 160, carbs: 490, fat: 80, sodium: 2300 });
    expect(resolveTargets({ kcal: 3200, protein: 170, carbs: 300, fat: 70, sodium: 2800 })).toMatchObject({
      kcal: 3200,
      protein: 170,
      carbs: 300,
      fat: 70,
      sodium: 2800,
    });

    const totals = mealTotals([
      { kcal: 600, protein: 40, carbs: 70, fat: 16, sodium: 400 },
      { kcal: 400, protein: 30, carbs: 40, fat: 10, sodium: 200 },
    ]);
    expect(totals.protein).toBe(70);
    expect(totals.sodium).toBe(600);
    expect(remaining(resolveTargets({ protein: 80, sodium: 800 }), totals).protein).toBe(10);
    expect(remaining(resolveTargets({ sodium: 800 }), totals).sodium).toBe(200);
    expect(inForDayLine(600, 3000, "cal")).toBe("600 cal/3000");
    expect(inForDayLine(800, 2300, "mg")).toBe("800 mg/2300");
    expect(inForDayLine(80, 160)).toBe("80/160");
    expect(inForDayLine(0, 3100, "cal")).toBe("0 cal/3100");
  });
});

describe("week shop list", () => {
  it("adds up the same ingredient across the week", () => {
    const week = weekDatesContaining("2026-09-18");
    const list = weekBuyList(week, {
      "2026-09-14": {
        meals: [{ name: "Chicken", amount: 400, unit: "g", kcal: 440, protein: 80, carbs: 0, fat: 10 }],
      },
      "2026-09-16": {
        meals: [{ name: "chicken", amount: 200, unit: "g", kcal: 220, protein: 40, carbs: 0, fat: 5 }],
      },
      "2026-09-17": {
        meals: [{ name: "Rice", amount: 150, unit: "g", kcal: 180, protein: 4, carbs: 40, fat: 0 }],
      },
    });
    expect(list).toHaveLength(2);
    expect(list[0]).toMatchObject({ name: "Chicken", amount: 600, unit: "g", protein: 120 });
    expect(list[1]).toMatchObject({ name: "Rice", amount: 150, unit: "g" });
  });

  it("shops ingredients from a cookbook food", () => {
    const week = weekDatesContaining("2026-09-18");
    const list = weekBuyList(week, {
      "2026-09-18": {
        meals: [
          {
            name: "Rice bowl",
            ingredients: [
              { name: "Chicken", amount: 200, unit: "g", kcal: 330, protein: 62 },
              { name: "Rice", amount: 150, unit: "g", kcal: 180, protein: 4 },
            ],
          },
        ],
      },
    });
    expect(list.map((item) => item.name)).toEqual(["Chicken", "Rice"]);
    expect(list[0].amount).toBe(200);
  });
});

describe("cookbook", () => {
  it("uses breakfast, lunch, dinner, and snack", () => {
    expect(MEAL_SLOTS.map((slot) => slot.id)).toEqual(["breakfast", "lunch", "dinner", "snack"]);
    expect(mealSlot("breakfast")).toBe("breakfast");
    expect(mealSlot("lunch")).toBe("lunch");
    expect(mealSlot("dinner")).toBe("dinner");
    expect(mealSlot("snack")).toBe("snack");
    expect(mealSlot("pre")).toBe("snack");
    expect(mealSlot("post")).toBe("snack");
    expect(mealSlot("evening")).toBe("snack");
  });

  it("scales a recipe and its ingredients onto a day", () => {
    const meal = scaleRecipe(
      {
        id: "bowl",
        name: "Rice bowl",
        ingredients: [
          { name: "Chicken", amount: 100, unit: "g", kcal: 165, protein: 31, carbs: 0, fat: 3.6, sodium: 80 },
          { name: "Rice", amount: 75, unit: "g", kcal: 90, protein: 2, carbs: 20, fat: 0, sodium: 5 },
        ],
      },
      2
    );
    expect(meal).toMatchObject({
      foodId: "bowl",
      name: "Rice bowl",
      servings: 2,
      kcal: 510,
      protein: 66,
      sodium: 170,
    });
    expect(meal.ingredients[0]).toMatchObject({ name: "Chicken", amount: 200, kcal: 330 });
  });

  it("formats a weigh-in for a calendar square", () => {
    expect(formatWeightKg("82.4")).toBe("82.4 kg");
    expect(formatWeightKg(82)).toBe("82 kg");
    expect(formatWeightKg("")).toBe("");
    expect(formatWeightKg(0)).toBe("");
  });

  it("prints kcal, protein, carbs, fat, and sodium for Nix", () => {
    expect(nutritionBits({ kcal: 330, protein: 62, carbs: 0, fat: 7.2, sodium: 180 })).toEqual([
      "330 kcal",
      "P 62",
      "C 0",
      "F 7.2",
      "Na 180",
    ]);
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
    expect(seesNutrition("nutritionist")).toBe(true);
    expect(seesNutrition("caleb")).toBe(false);
  });
});
