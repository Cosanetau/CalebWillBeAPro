export const PERSIST_DEBOUNCE_MS = 800;

export function bumpPersistGen(gen) {
  return Number(gen || 0) + 1;
}

export function isStaleSave(sentGen, currentGen) {
  return sentGen !== currentGen;
}

export function keepLocalState(local, saved) {
  if (!local) return saved;
  if (!saved) return local;
  return {
    ...local,
    rev: saved.rev ?? local.rev,
    updatedAt: saved.updatedAt ?? local.updatedAt,
  };
}
