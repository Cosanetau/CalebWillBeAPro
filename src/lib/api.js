import { emptyState } from "./state.js";

async function request(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "Request failed");
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

export async function fetchSetup() {
  try {
    return await request("/api/setup");
  } catch {
    return { ok: false, setup: {} };
  }
}

export async function fetchMe() {
  return request("/api/me");
}

export async function signIn(username, password) {
  return request("/api/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export async function signOut() {
  try {
    await request("/api/logout", { method: "POST" });
  } catch {
    // still clear the local session
  }
}

export async function loadState() {
  const result = await request("/api/state");
  return {
    state: { ...emptyState(), ...result.state },
    warning: result.warning || "",
  };
}

export async function saveState(state) {
  const result = await request("/api/state", {
    method: "PUT",
    body: JSON.stringify({ state }),
  });
  return {
    state: { ...emptyState(), ...result.state },
    warning: result.warning || "",
  };
}
