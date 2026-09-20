import { describe, expect, it } from "vitest";
import { PERSIST_DEBOUNCE_MS, bumpPersistGen, isStaleSave, keepLocalState } from "./persistClient.js";

describe("persist while typing", () => {
  it("waits longer than a keystroke before saving", () => {
    expect(PERSIST_DEBOUNCE_MS).toBeGreaterThanOrEqual(800);
  });

  it("drops a save that finished after a newer edit", () => {
    let gen = 0;
    gen = bumpPersistGen(gen);
    const first = gen;
    gen = bumpPersistGen(gen);
    expect(isStaleSave(first, gen)).toBe(true);
    expect(isStaleSave(gen, gen)).toBe(false);
  });

  it("keeps local digits instead of replacing the whole book from the save response", () => {
    const local = {
      rev: 4,
      nutritionTargets: { kcal: "36", protein: 160, carbs: 490, fat: 80, sodium: 2300 },
    };
    const saved = {
      rev: 5,
      updatedAt: "2026-09-20T00:00:00.000Z",
      nutritionTargets: { kcal: 3, protein: 160, carbs: 490, fat: 80, sodium: 2300 },
    };
    expect(keepLocalState(local, saved)).toMatchObject({
      rev: 5,
      updatedAt: "2026-09-20T00:00:00.000Z",
      nutritionTargets: { kcal: "36" },
    });
  });
});
