import { useState } from "react";
import { accessWordError } from "../lib/access.js";
import { useApp } from "../lib/useApp.jsx";

export default function AccessGate() {
  const { auth, unlock } = useApp();
  const [word, setWord] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const creating = auth.needsSetup;

  async function onSubmit(event) {
    event.preventDefault();
    const problem = accessWordError(word, { creating });
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await unlock(word);
    } catch (err) {
      setError(err.message || "Could not get in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="gate">
      <section className="gate-card">
        <div className="mark lg" aria-hidden="true" />
        <p className="kicker">Private · Tokyo time</p>
        <h1>Caleb Will Be A Pro</h1>
        <p className="lede">
          Gym, food, and calendar for ice hockey in Japan. Built for Caleb and his
          nutritionist. Not a public site.
        </p>
        <form onSubmit={onSubmit}>
          <label>
            {creating ? "Set the shared access word" : "Shared access word"}
            <input
              autoFocus
              autoComplete={creating ? "new-password" : "current-password"}
              type="password"
              value={word}
              onChange={(event) => setWord(event.target.value)}
              placeholder={creating ? "one word you both know" : "enter the word"}
            />
          </label>
          <p className="hint">
            {creating
              ? "One word, no spaces. Caleb and the nutritionist both use this. You can only set it once."
              : "Same word for both of you. This is not an email login."}
          </p>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" disabled={busy}>
            {busy ? "Checking…" : creating ? "Lock it in" : "Open"}
          </button>
        </form>
      </section>
    </main>
  );
}
