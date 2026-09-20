import { afterEach, describe, expect, it } from "vitest";
import { explainSupabaseError, normalizeSupabaseUrl } from "./supabase-admin.mjs";

const originalUrl = process.env.SUPABASE_URL;
const originalKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

afterEach(() => {
  if (originalUrl == null) delete process.env.SUPABASE_URL;
  else process.env.SUPABASE_URL = originalUrl;
  if (originalKey == null) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  else process.env.SUPABASE_SERVICE_ROLE_KEY = originalKey;
});

describe("supabase url", () => {
  it("keeps the project origin and drops /rest/v1/", () => {
    expect(normalizeSupabaseUrl("https://jabxwugsawzhwiahdlbk.supabase.co")).toBe(
      "https://jabxwugsawzhwiahdlbk.supabase.co"
    );
    expect(normalizeSupabaseUrl("https://jabxwugsawzhwiahdlbk.supabase.co/rest/v1/")).toBe(
      "https://jabxwugsawzhwiahdlbk.supabase.co"
    );
    expect(normalizeSupabaseUrl(" https://jabxwugsawzhwiahdlbk.supabase.co/rest/v1 ")).toBe(
      "https://jabxwugsawzhwiahdlbk.supabase.co"
    );
    expect(normalizeSupabaseUrl("")).toBe("");
  });

  it("explains the invalid path banner", () => {
    process.env.SUPABASE_URL = "https://jabxwugsawzhwiahdlbk.supabase.co/rest/v1/";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-key";
    expect(explainSupabaseError(new Error("Invalid path specified in request URL"))).toMatch(/drop \/rest\/v1/i);
  });
});
