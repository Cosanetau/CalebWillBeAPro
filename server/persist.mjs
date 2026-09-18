import fs from "node:fs";
import path from "node:path";
import { emptyState } from "../src/lib/state.js";
import { adminClient, explainSupabaseError, supabaseServiceKey, supabaseUrl } from "./supabase-admin.mjs";

const KV_KEY = "cwbp-state";

let persistWarning = "";

function kvEnabled() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function filePath() {
  if (process.env.VERCEL) return path.join("/tmp", "cwbp-state.json");
  return path.join(process.cwd(), "data", "state.json");
}

export function persistKind() {
  if (supabaseUrl() && supabaseServiceKey()) return "supabase";
  if (kvEnabled()) return "kv";
  if (process.env.VERCEL) return "tmp";
  return "file";
}

export function getPersistWarning() {
  return persistWarning;
}

function cleanState(state) {
  const { accessWordHash, sessions, ...payload } = state || {};
  return { ...emptyState(), ...payload };
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

function readFileState() {
  try {
    return cleanState(JSON.parse(fs.readFileSync(filePath(), "utf8")));
  } catch {
    return emptyState();
  }
}

function writeFileState(state) {
  const next = cleanState({ ...state, rev: Number(state.rev || 0) + 1, updatedAt: new Date().toISOString() });
  fs.mkdirSync(path.dirname(filePath()), { recursive: true });
  fs.writeFileSync(filePath(), JSON.stringify(next, null, 2));
  return next;
}

async function supabaseRead() {
  const admin = adminClient();
  if (!admin) throw new Error(explainSupabaseError(new Error("Missing Supabase env")));
  const { data, error } = await admin.from("cwbp_state").select("payload").eq("id", 1).maybeSingle();
  if (error) throw new Error(explainSupabaseError(error));
  if (!data) {
    const empty = emptyState();
    const { error: insertError } = await admin.from("cwbp_state").insert({ id: 1, payload: empty });
    if (insertError && !String(insertError.message || "").toLowerCase().includes("duplicate")) {
      throw new Error(explainSupabaseError(insertError));
    }
    return empty;
  }
  return cleanState(data.payload);
}

async function supabaseWrite(state) {
  const admin = adminClient();
  if (!admin) throw new Error(explainSupabaseError(new Error("Missing Supabase env")));
  const payload = cleanState(state);
  const { data, error } = await admin
    .from("cwbp_state")
    .upsert({ id: 1, payload, updated_at: new Date().toISOString() })
    .select("payload")
    .single();
  if (error) throw new Error(explainSupabaseError(error));
  return cleanState(data?.payload || payload);
}

async function readFallback() {
  if (kvEnabled()) return cleanState((await kvGet()) || emptyState());
  return readFileState();
}

async function writeFallback(state) {
  if (kvEnabled()) {
    const next = cleanState({ ...state, rev: Number(state.rev || 0) + 1, updatedAt: new Date().toISOString() });
    await kvSet(next);
    return next;
  }
  return writeFileState(state);
}

export async function readAppState() {
  persistWarning = "";
  if (persistKind() === "supabase") {
    try {
      return await supabaseRead();
    } catch (error) {
      persistWarning = error.message || "Could not open the shared book.";
      return readFallback();
    }
  }
  if (!kvEnabled() && process.env.VERCEL) {
    persistWarning = "Saving on this server only. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to share between phones.";
  }
  return readFallback();
}

export async function writeAppState(state) {
  persistWarning = "";
  if (persistKind() === "supabase") {
    try {
      return await supabaseWrite(state);
    } catch (error) {
      persistWarning = error.message || "Could not save the shared book.";
      return writeFallback(state);
    }
  }
  if (!kvEnabled() && process.env.VERCEL) {
    persistWarning = "Saving on this server only. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to share between phones.";
  }
  return writeFallback(state);
}
