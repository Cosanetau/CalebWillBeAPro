import { afterEach, describe, expect, it } from "vitest";
import { getPersistWarning, persistKind, readAppState, writeAppState } from "./persist.mjs";

const keys = [
  "VERCEL",
  "SUPABASE_URL",
  "VITE_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN",
];
const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));

afterEach(() => {
  for (const key of keys) {
    if (original[key] == null) delete process.env[key];
    else process.env[key] = original[key];
  }
});

describe("persist warnings", () => {
  it("does not put Vercel setup instructions in the book", async () => {
    process.env.VERCEL = "1";
    delete process.env.SUPABASE_URL;
    delete process.env.VITE_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;

    expect(persistKind()).toBe("tmp");
    await readAppState();
    expect(getPersistWarning()).toBe("");
    expect(getPersistWarning()).not.toMatch(/SUPABASE/);

    await writeAppState({ foods: [] });
    expect(getPersistWarning()).toBe("");
  });
});
