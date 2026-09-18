export async function hashAccessWord(word) {
  const trimmed = String(word || "").trim().toLowerCase();
  const bytes = new TextEncoder().encode(`cwbp:${trimmed}`);
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function normalizeAccessWord(word) {
  return String(word || "").trim();
}

export function accessWordError(word, { creating = false } = {}) {
  const value = normalizeAccessWord(word);
  if (!value) return "Enter the shared access word.";
  if (creating && value.length < 4) return "Use at least 4 characters.";
  if (/\s/.test(value)) return "Use one word, no spaces.";
  return "";
}
