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

export async function fetchAuth() {
  return request("/api/auth");
}

export async function submitAccessWord(word) {
  return request("/api/auth", {
    method: "POST",
    body: JSON.stringify({ word }),
  });
}

export async function signOut() {
  return request("/api/auth", { method: "DELETE" });
}

export async function loadState() {
  const { state } = await request("/api/state");
  return { ...emptyState(), ...state };
}

export async function saveState(state) {
  const { sessions, ...safe } = state;
  const { state: next } = await request("/api/state", {
    method: "PUT",
    body: JSON.stringify({ state: safe }),
  });
  return { ...emptyState(), ...next };
}
