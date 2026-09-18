import { loginFieldError, usernameToEmail } from "./accounts.js";
import { supabase } from "./supabase.js";

export async function seedAccounts() {
  try {
    await fetch("/api/seed", { method: "POST" });
  } catch {
    // Seed is best-effort. Login still works if the users already exist.
  }
}

export async function signIn(username, password) {
  const error = loginFieldError({ username, password });
  if (error) throw new Error(error);

  const { error: authError } = await supabase.auth.signInWithPassword({
    email: usernameToEmail(username),
    password,
  });
  if (authError) {
    throw new Error("That username or password is not right.");
  }
}

export async function signOut() {
  await supabase.auth.signOut();
}
