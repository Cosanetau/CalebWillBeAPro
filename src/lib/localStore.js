import { emptyState } from "./state.js";
import { accessWordError, hashAccessWord } from "./access.js";

const STATE_KEY = "cwbp_local_state";
const SESSION_KEY = "cwbp_unlocked";

export function persistUsesApi(kind) {
  return kind === "kv" || kind === "file";
}

export function readLocalState() {
  try {
    return { ...emptyState(), ...JSON.parse(localStorage.getItem(STATE_KEY) || "{}") };
  } catch {
    return emptyState();
  }
}

export function writeLocalState(state) {
  const next = { ...state, rev: Number(state.rev || 0) + 1, updatedAt: new Date().toISOString() };
  localStorage.setItem(STATE_KEY, JSON.stringify(next));
  return next;
}

export function localAuthStatus() {
  const state = readLocalState();
  return {
    ok: sessionStorage.getItem(SESSION_KEY) === "1" && Boolean(state.accessWordHash),
    needsSetup: !state.accessWordHash,
    persist: "local",
  };
}

export async function localUnlock(word) {
  const state = readLocalState();
  const creating = !state.accessWordHash;
  const error = accessWordError(word, { creating });
  if (error) throw new Error(error);

  const hash = await hashAccessWord(word);
  if (creating) {
    writeLocalState({ ...state, accessWordHash: hash });
  } else if (hash !== state.accessWordHash) {
    throw new Error("That access word is not right.");
  }

  sessionStorage.setItem(SESSION_KEY, "1");
  return { ok: true, created: creating };
}

export function localLock() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function publicLocalState(state = readLocalState()) {
  const { sessions, accessWordHash, ...safe } = state;
  return { ...emptyState(), ...safe };
}
