import { emptyState } from "./state.js";
import { supabase } from "./supabase.js";
import { roleForUsername } from "./accounts.js";

export async function currentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function loadProfile() {
  const session = await currentSession();
  if (!session) return null;

  const { data } = await supabase
    .from("cwbp_profiles")
    .select("username, role")
    .eq("id", session.user.id)
    .maybeSingle();

  if (data?.username) {
    return { username: data.username, role: data.role };
  }

  const username = session.user.user_metadata?.username || session.user.email?.split("@")[0] || "Caleb";
  return { username, role: roleForUsername(username) };
}

export async function loadState() {
  const { data, error } = await supabase.from("cwbp_state").select("payload").eq("id", 1).maybeSingle();
  if (error) throw new Error(error.message);
  return { ...emptyState(), ...(data?.payload || {}) };
}

export async function saveState(state) {
  const { accessWordHash, sessions, ...payload } = state;
  const { data, error } = await supabase
    .from("cwbp_state")
    .upsert({ id: 1, payload, updated_at: new Date().toISOString() })
    .select("payload")
    .single();
  if (error) throw new Error(error.message);
  return { ...emptyState(), ...(data?.payload || payload) };
}
