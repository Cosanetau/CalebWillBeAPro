import { clearSessionCookie, loginWithPassword, makeSessionCookie, readSession } from "./auth.mjs";
import { getPersistWarning, persistKind, readAppState, writeAppState } from "./persist.mjs";
import { seedUsers } from "./seed-users.mjs";
import { setupStatus } from "./supabase-admin.mjs";

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    ...headers,
  });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  if (req.body != null && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return Promise.resolve(req.body);
  }
  if (typeof req.body === "string") {
    return Promise.resolve(req.body ? JSON.parse(req.body) : {});
  }
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      if (!raw) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function statePayload(state) {
  return {
    state,
    persist: persistKind(),
    warning: getPersistWarning() || undefined,
  };
}

export async function handleApi(req, res) {
  const url = new URL(req.url, "http://localhost");

  if (req.method === "GET" && (url.pathname === "/api/health" || url.pathname === "/api/setup")) {
    send(res, 200, { ok: true, persist: persistKind(), setup: setupStatus() });
    return true;
  }

  if (url.pathname === "/api/seed" && (req.method === "GET" || req.method === "POST")) {
    const result = await seedUsers();
    send(res, result.ok ? 200 : 500, result);
    return true;
  }

  if (url.pathname === "/api/login" && req.method === "POST") {
    const body = await readBody(req);
    const result = loginWithPassword(body.username, body.password);
    if (!result.ok) {
      send(res, 401, result);
      return true;
    }
    send(res, 200, result, { "Set-Cookie": makeSessionCookie(result.user.id, result.user.username, req) });
    return true;
  }

  if (url.pathname === "/api/logout" && (req.method === "POST" || req.method === "DELETE")) {
    send(res, 200, { ok: true }, { "Set-Cookie": clearSessionCookie(req) });
    return true;
  }

  if (url.pathname === "/api/me" && req.method === "GET") {
    const session = readSession(req);
    if (!session) {
      send(res, 200, { ok: false });
      return true;
    }
    send(res, 200, { ok: true, user: session });
    return true;
  }

  if (url.pathname === "/api/state" && req.method === "GET") {
    const session = readSession(req);
    if (!session) {
      send(res, 401, { error: "Sign in first." });
      return true;
    }
    try {
      send(res, 200, statePayload(await readAppState()));
    } catch (error) {
      send(res, 500, { error: error.message });
    }
    return true;
  }

  if (url.pathname === "/api/state" && req.method === "PUT") {
    const session = readSession(req);
    if (!session) {
      send(res, 401, { error: "Sign in first." });
      return true;
    }
    try {
      const body = await readBody(req);
      send(res, 200, statePayload(await writeAppState(body.state || {})));
    } catch (error) {
      send(res, 500, { error: error.message });
    }
    return true;
  }

  return false;
}
