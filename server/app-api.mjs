import { accessWordError, hashAccessWord } from "../src/lib/access.js";
import {
  createSessionToken,
  parseCookies,
  readState,
  seedAccessWord,
  sessionCookie,
  validSession,
  writeState,
} from "./persist.mjs";

function publicState(state) {
  const { sessions, accessWordHash, ...safe } = state;
  return safe;
}

function send(res, status, body, headers = {}) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    ...headers,
  });
  res.end(payload);
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

async function authorizedState(req) {
  const state = await seedAccessWord(await readState());
  const token = parseCookies(req.headers.cookie || "").cwbp_session;
  return { state, token, ok: validSession(state, token) };
}

export async function handleApi(req, res) {
  const url = new URL(req.url, "http://localhost");

  if (req.method === "GET" && url.pathname === "/api/health") {
    send(res, 200, { ok: true });
    return true;
  }

  if (url.pathname === "/api/auth" && req.method === "GET") {
    const { state, ok } = await authorizedState(req);
    send(res, 200, {
      ok,
      needsSetup: !state.accessWordHash,
    });
    return true;
  }

  if (url.pathname === "/api/auth" && req.method === "POST") {
    const body = await readBody(req);
    const state = await seedAccessWord(await readState());
    const creating = !state.accessWordHash;
    const error = accessWordError(body.word, { creating });
    if (error) {
      send(res, 400, { error });
      return true;
    }

    const hash = await hashAccessWord(body.word);
    if (creating) {
      const token = createSessionToken();
      await writeState({
        ...state,
        accessWordHash: hash,
        sessions: [{ token, createdAt: Date.now() }],
      });
      send(res, 200, { ok: true, created: true }, { "Set-Cookie": sessionCookie(token) });
      return true;
    }

    if (hash !== state.accessWordHash) {
      send(res, 401, { error: "That access word is not right." });
      return true;
    }

    const token = createSessionToken();
    const sessions = [...(state.sessions || []), { token, createdAt: Date.now() }].slice(-20);
    await writeState({ ...state, sessions });
    send(res, 200, { ok: true }, { "Set-Cookie": sessionCookie(token) });
    return true;
  }

  if (url.pathname === "/api/auth" && req.method === "DELETE") {
    const { state, token } = await authorizedState(req);
    await writeState({
      ...state,
      sessions: (state.sessions || []).filter((session) => session.token !== token),
    });
    send(res, 200, { ok: true }, { "Set-Cookie": "cwbp_session=; Path=/; Max-Age=0" });
    return true;
  }

  if (url.pathname === "/api/state" && req.method === "GET") {
    const { state, ok } = await authorizedState(req);
    if (!ok) {
      send(res, 401, { error: "Locked." });
      return true;
    }
    send(res, 200, { state: publicState(state) });
    return true;
  }

  if (url.pathname === "/api/state" && req.method === "PUT") {
    const { state, ok, token } = await authorizedState(req);
    if (!ok) {
      send(res, 401, { error: "Locked." });
      return true;
    }
    const body = await readBody(req);
    const incoming = body.state || {};
    const next = await writeState({
      ...state,
      ...incoming,
      accessWordHash: state.accessWordHash,
      sessions: state.sessions,
      rev: state.rev,
    });
    send(res, 200, { state: publicState(next), tokenKept: Boolean(token) });
    return true;
  }

  return false;
}
