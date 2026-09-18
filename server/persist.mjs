import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { emptyState } from "../src/lib/state.js";
import { hashAccessWord } from "../src/lib/access.js";

const KV_KEY = "cwbp-state";

function filePath() {
  if (process.env.VERCEL) return path.join("/tmp", "cwbp-state.json");
  return path.join(process.cwd(), "data", "state.json");
}

export function persistKind() {
  if (kvEnabled()) return "kv";
  if (process.env.VERCEL) return "tmp";
  return "file";
}

async function kvGet() {
  const response = await fetch(`${process.env.KV_REST_API_URL}/get/${KV_KEY}`, {
    headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` },
  });
  if (!response.ok) return null;
  const payload = await response.json();
  if (!payload?.result) return null;
  return typeof payload.result === "string" ? JSON.parse(payload.result) : payload.result;
}

async function kvSet(state) {
  await fetch(`${process.env.KV_REST_API_URL}/set/${KV_KEY}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(state),
  });
}

export async function readState() {
  if (kvEnabled()) {
    return (await kvGet()) || emptyState();
  }

  try {
    return JSON.parse(fs.readFileSync(filePath(), "utf8"));
  } catch {
    return emptyState();
  }
}

export async function writeState(state) {
  const next = { ...state, rev: Number(state.rev || 0) + 1, updatedAt: new Date().toISOString() };
  if (kvEnabled()) {
    await kvSet(next);
    return next;
  }
  fs.mkdirSync(path.dirname(filePath()), { recursive: true });
  fs.writeFileSync(filePath(), JSON.stringify(next, null, 2));
  return next;
}

export async function seedAccessWord(state) {
  if (state.accessWordHash || !process.env.ACCESS_WORD) return state;
  return writeState({
    ...state,
    accessWordHash: await hashAccessWord(process.env.ACCESS_WORD),
  });
}

export function validSession(state, token) {
  if (!token) return false;
  const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 30;
  return (state.sessions || []).some((session) => session.token === token && session.createdAt > cutoff);
}

export function createSessionToken() {
  return randomUUID();
}

export function parseCookies(header = "") {
  return Object.fromEntries(
    header
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const index = part.indexOf("=");
        return [part.slice(0, index), decodeURIComponent(part.slice(index + 1))];
      })
  );
}

export function sessionCookie(token) {
  return `cwbp_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000`;
}
