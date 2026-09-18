import { emptyState } from "./state.js";
import {
  localAuthStatus,
  localLock,
  localUnlock,
  persistUsesApi,
  publicLocalState,
  readLocalState,
  writeLocalState,
} from "./localStore.js";

let mode = "local";

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
  try {
    const remote = await request("/api/auth");
    if (persistUsesApi(remote.persist)) {
      mode = "api";
      return remote;
    }
  } catch {
    // Vercel without a durable store, or a static-only deploy.
  }
  mode = "local";
  return localAuthStatus();
}

export async function submitAccessWord(word) {
  if (mode === "api") {
    return request("/api/auth", {
      method: "POST",
      body: JSON.stringify({ word }),
    });
  }
  return localUnlock(word);
}

export async function signOut() {
  if (mode === "api") {
    try {
      await request("/api/auth", { method: "DELETE" });
    } catch {
      // Still lock the browser copy.
    }
  }
  localLock();
}

export async function loadState() {
  if (mode === "api") {
    const { state } = await request("/api/state");
    return { ...emptyState(), ...state };
  }
  return publicLocalState();
}

export async function saveState(state) {
  if (mode === "api") {
    const { sessions, ...safe } = state;
    const { state: next } = await request("/api/state", {
      method: "PUT",
      body: JSON.stringify({ state: safe }),
    });
    return { ...emptyState(), ...next };
  }
  const current = readLocalState();
  return publicLocalState(
    writeLocalState({
      ...current,
      ...state,
      accessWordHash: current.accessWordHash,
    })
  );
}
