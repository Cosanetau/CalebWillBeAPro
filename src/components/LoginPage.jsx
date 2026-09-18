import { useState } from "react";
import { loginFieldError } from "../lib/accounts.js";
import { useApp } from "../lib/useApp.jsx";

export default function LoginPage() {
  const { login } = useApp();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
      setError(err.message || err.data?.error || "Could not get in.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="gate">
      <section className="gate-card">
        <h1>
          Caleb
          <span>will be a pro</span>
        </h1>
        <p className="lede">Hockey log. Gym, food, games. Me and Nix.</p>
        <form onSubmit={onSubmit}>
          <label>
            Name
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
            {busy ? "Hang on…" : "Come in"}
          </button>
        </form>
      </section>
    </main>
  );
}
