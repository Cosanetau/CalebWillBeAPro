import { ACCOUNTS, usernameToEmail } from "../src/lib/accounts.js";
import { emptyState } from "../src/lib/state.js";
import { passwordFor } from "./auth.mjs";
import { adminClient, explainSupabaseError, setupStatus } from "./supabase-admin.mjs";

async function findUserByEmail(admin, email) {
  if (typeof admin.auth.admin.getUserByEmail === "function") {
    const { data, error } = await admin.auth.admin.getUserByEmail(email);
    if (!error) return data?.user || null;
    const notFound =
      error.status === 404 ||
      error.code === 404 ||
      String(error.message || "").toLowerCase().includes("not found");
    if (!notFound) throw error;
  }

  const { data, error } = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw error;
  return (data?.users || []).find((user) => user.email === email) || null;
}

async function ensureAccount(admin, account) {
  const email = usernameToEmail(account.username);
  const password = passwordFor(account.username);
  if (!password) {
    return { username: account.username, created: false, skipped: "no password env" };
  }

  let user = await findUserByEmail(admin, email);
  let created = false;

  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username: account.username, role: account.role },
    });
    if (error) throw error;
    user = data.user;
    created = true;
  } else {
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      password,
      email_confirm: true,
      user_metadata: { username: account.username, role: account.role },
    });
    if (error) throw error;
  }

  const { error: profileError } = await admin.from("cwbp_profiles").upsert({
    id: user.id,
    username: account.username,
    role: account.role,
  });
  if (profileError) throw profileError;

  return { username: account.username, created, role: account.role };
}

async function ensureStateRow(admin) {
  const { data, error } = await admin.from("cwbp_state").select("id").eq("id", 1).maybeSingle();
  if (error) throw error;
  if (data) return;
  const { error: insertError } = await admin.from("cwbp_state").insert({ id: 1, payload: emptyState() });
  if (insertError && !String(insertError.message || "").toLowerCase().includes("duplicate")) {
    throw insertError;
  }
}

export async function seedUsers() {
  const admin = adminClient();
  if (!admin) {
    return { ok: false, error: explainSupabaseError(new Error("Missing Supabase env")), setup: setupStatus() };
  }

  try {
    await ensureStateRow(admin);
    const users = [];
    for (const account of ACCOUNTS) {
      users.push(await ensureAccount(admin, account));
    }
    return { ok: true, users, setup: setupStatus() };
  } catch (error) {
    return { ok: false, error: explainSupabaseError(error), setup: setupStatus() };
  }
}
