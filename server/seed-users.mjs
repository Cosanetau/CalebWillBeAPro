import { ACCOUNTS, usernameToEmail } from "../src/lib/accounts.js";
import { emptyState } from "../src/lib/state.js";
import { adminClient } from "./supabase-admin.mjs";

function passwordFor(username) {
  const key = String(username).trim().toLowerCase();
  if (key === "nix") return process.env.NIX_PASSWORD || "NixIsTheBest";
  if (key === "caleb") return process.env.CALEB_PASSWORD || "";
  return "";
}

async function ensureStateRow(admin) {
  const { data } = await admin.from("cwbp_state").select("id").eq("id", 1).maybeSingle();
  if (data) return;
  const { error } = await admin.from("cwbp_state").insert({ id: 1, payload: emptyState() });
  if (error && !String(error.message || "").toLowerCase().includes("duplicate")) {
    throw error;
  }
}

async function findUserByEmail(admin, email) {
  const { data, error } = await admin.auth.admin.getUserByEmail(email);
  if (error) {
    const notFound =
      error.status === 404 ||
      error.code === 404 ||
      String(error.message || "").toLowerCase().includes("not found");
    if (notFound) return null;
    throw error;
  }
  return data?.user || null;
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
  }

  const { error: profileError } = await admin.from("cwbp_profiles").upsert({
    id: user.id,
    username: account.username,
    role: account.role,
  });
  if (profileError) throw profileError;

  return { username: account.username, created, role: account.role };
}

export async function seedUsers() {
  const admin = adminClient();
  if (!admin) {
    return { ok: false, error: "Missing SUPABASE_SERVICE_ROLE_KEY." };
  }

  try {
    await ensureStateRow(admin);
    const users = [];
    for (const account of ACCOUNTS) {
      users.push(await ensureAccount(admin, account));
    }
    return { ok: true, users };
  } catch (error) {
    return { ok: false, error: error.message || "Could not seed users." };
  }
}
