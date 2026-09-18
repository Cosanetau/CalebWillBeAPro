import { createClient } from "@supabase/supabase-js";

const DEFAULT_URL = "https://hfyjnejbmelaskfkhpuv.supabase.co";

export function supabaseUrl() {
  return process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || DEFAULT_URL;
}

export function adminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;
  return createClient(supabaseUrl(), key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
