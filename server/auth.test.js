import { afterEach, describe, expect, it } from "vitest";
import { loginWithPassword, makeSessionCookie, passwordsMatch, passwordFor, readSession } from "./auth.mjs";

const original = { ...process.env };

afterEach(() => {
  for (const key of ["CALEB_PASSWORD", "NIX_PASSWORD", "VERCEL"]) {
    if (original[key] == null) delete process.env[key];
    else process.env[key] = original[key];
  }
});

describe("passwords", () => {
  it("lets Nix in with the default password", () => {
    delete process.env.NIX_PASSWORD;
    expect(passwordFor("Nix")).toBe("NixIsTheBest");
    expect(loginWithPassword("Nix", "NixIsTheBest")).toMatchObject({
      ok: true,
      user: { username: "Nix", role: "nutritionist" },
    });
  });

  it("lets Caleb in once CALEB_PASSWORD is set", () => {
    process.env.CALEB_PASSWORD = "SkateHard";
    expect(loginWithPassword("Caleb", "SkateHard").ok).toBe(true);
    expect(loginWithPassword("Caleb", "wrong").error).toMatch(/password/i);
  });

  it("tells you when Caleb’s password is missing", () => {
    delete process.env.CALEB_PASSWORD;
    const result = loginWithPassword("Caleb", "anything");
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/CALEB_PASSWORD/);
  });

  it("does not treat different-length secrets as equal", () => {
    expect(passwordsMatch("abc", "ab")).toBe(false);
    expect(passwordsMatch("abc", "abc")).toBe(true);
  });
});

describe("session cookie", () => {
  it("round-trips Caleb’s session", () => {
    process.env.CALEB_PASSWORD = "SkateHard";
    const header = makeSessionCookie("caleb", "Caleb", { headers: {} });
    const cookie = header.split(";")[0];
    const session = readSession({ headers: { cookie } });
    expect(session).toMatchObject({ username: "Caleb", role: "caleb" });
  });
});
