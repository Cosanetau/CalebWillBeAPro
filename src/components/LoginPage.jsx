import { useEffect, useState } from "react";
import { loginFieldError } from "../lib/accounts.js";
import { seedAccounts } from "../lib/api.js";
import { useApp } from "../lib/useApp.jsx";

export default function LoginPage() {
  const { login } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    seedAccounts();
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    const problem = loginFieldError({ username, password });
    if (problem) {
      setError(problem);
      return;
    }
    setBusy(true);
    setError("");
    try {
      await login(username, password);
    } catch (err) {
      setError(err.message || "Could not sign in.");
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
          Gym, food, and calendar for ice hockey in Japan. Sign in as Caleb or Nix.
        </p>
        <form onSubmit={onSubmit}>
          <label>
            Username
            <input
              autoFocus
              autoComplete="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Caleb or Nix"
            />
          </label>
          <label>
            Password
            <input
              autoComplete="current-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error ? <p className="form-error">{error}</p> : null}
          <button className="btn" type="submit" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
