import { createClient } from "@supabase/supabase-js";

export function normalizeSupabaseUrl(raw) {
  const trimmed = String(raw || "").trim();
  if (!trimmed) return "";
  try {
    const url = new URL(trimmed);
    return url.origin;
  } catch {
    return trimmed.replace(/\/+$/, "").replace(/\/rest\/v1$/i, "");
  }
}

export function supabaseUrl() {
  return normalizeSupabaseUrl(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "");
}

export function supabaseAnonKey() {
  return process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
}

export function supabaseServiceKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

export function adminClient() {
  const url = supabaseUrl();
  const key = supabaseServiceKey();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function authClient() {
  const url = supabaseUrl();
  const key = supabaseAnonKey() || supabaseServiceKey();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function setupStatus() {
  let host = "";
  try {
    host = supabaseUrl() ? new URL(supabaseUrl()).host : "";
  } catch {
    host = "invalid SUPABASE_URL";
  }
  return {
    hasUrl: Boolean(supabaseUrl()),
    hasService: Boolean(supabaseServiceKey()),
    hasAnon: Boolean(supabaseAnonKey()),
    hasCalebPassword: Boolean(process.env.CALEB_PASSWORD),
    host,
  };
}

export function explainSupabaseError(error) {
  const message = error?.message || String(error);
  const cause = error?.cause?.message || error?.cause?.code || "";
  const combined = `${message} ${cause}`.toLowerCase();
  if (!supabaseUrl()) return "Missing SUPABASE_URL on Vercel.";
  if (!supabaseServiceKey()) return "Missing SUPABASE_SERVICE_ROLE_KEY on Vercel.";
  if (combined.includes("fetch failed") || combined.includes("enotfound") || combined.includes("getaddrinfo")) {
    return `Cannot reach Supabase (${setupStatus().host}). Check SUPABASE_URL is the real https://xxxx.supabase.co value.`;
  }
  if (combined.includes("schema cache") || combined.includes("does not exist") || combined.includes("could not find the table")) {
    return "The tables are missing. Run supabase/schema.sql in the Supabase SQL editor, then try again.";
  }
  if (combined.includes("invalid path") || combined.includes("rest/v1")) {
    return "SUPABASE_URL should be https://xxxx.supabase.co with nothing after .co — drop /rest/v1/";
  }
  if (combined.includes("jwt") || combined.includes("invalid api key") || combined.includes("unauthorized")) {
    return "Supabase URL and service role key do not match the same project.";
  }
  return [message, cause].filter(Boolean).join(" — ");
}
