import { createHmac, timingSafeEqual } from "node:crypto";
import { findAccount, loginFieldError } from "../src/lib/accounts.js";
import { supabaseServiceKey } from "./supabase-admin.mjs";

export function passwordFor(username) {
  const key = String(username || "").trim().toLowerCase();
  if (key === "nix") return process.env.NIX_PASSWORD || "NixIsTheBest";
  if (key === "caleb") return process.env.CALEB_PASSWORD || "";
  return "";
}

export function passwordsMatch(given, expected) {
  if (!expected) return false;
  const a = Buffer.from(String(given));
  const b = Buffer.from(String(expected));
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function sessionSecret() {
  return process.env.CALEB_PASSWORD || supabaseServiceKey() || process.env.NIX_PASSWORD || "cwbp-dev";
}

function cookieHeader(value, { clear = false, secure = false } = {}) {
  const parts = [`cwbp=${clear ? "" : value}`, "Path=/", "HttpOnly", "SameSite=Lax", clear ? "Max-Age=0" : "Max-Age=2592000"];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function isSecureRequest(req) {
  if (process.env.VERCEL) return true;
  const proto = String(req?.headers?.["x-forwarded-proto"] || "")
    .split(",")[0]
    .trim();
  return proto === "https";
}

export function makeSessionCookie(userId, username, req) {
  const payload = `${userId}|${username}`;
  const sig = createHmac("sha256", sessionSecret()).update(payload).digest("hex");
  const value = Buffer.from(`${payload}|${sig}`).toString("base64url");
  return cookieHeader(value, { secure: isSecureRequest(req) });
}

export function clearSessionCookie(req) {
  return cookieHeader("", { clear: true, secure: isSecureRequest(req) });
}

export function readSession(req) {
  const header = req.headers?.cookie || "";
  const match = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("cwbp="));
  if (!match) return null;
  try {
    const raw = Buffer.from(match.slice(5), "base64url").toString("utf8");
    const [userId, username, sig] = raw.split("|");
    if (!userId || !username || !sig) return null;
    const expected = createHmac("sha256", sessionSecret()).update(`${userId}|${username}`).digest("hex");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const account = findAccount(username);
    if (!account) return null;
    return { userId, username: account.username, role: account.role };
  } catch {
    return null;
  }
}

export function loginWithPassword(username, password) {
  const fieldError = loginFieldError({ username, password });
  if (fieldError) return { ok: false, error: fieldError };

  const account = findAccount(username);
  const expected = passwordFor(account.username);

  if (account.username === "Caleb" && !expected) {
    return {
      ok: false,
      error: "Caleb’s password is not on Vercel yet. Add CALEB_PASSWORD and redeploy.",
    };
  }

  if (!passwordsMatch(password, expected)) {
    return { ok: false, error: "That’s not the password." };
  }

  return {
    ok: true,
    user: {
      id: account.username.toLowerCase(),
      username: account.username,
      role: account.role,
    },
  };
}
