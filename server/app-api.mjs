import { seedUsers } from "./seed-users.mjs";

function send(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  res.end(payload);
}

export async function handleApi(req, res) {
  const url = new URL(req.url, "http://localhost");

  if (req.method === "GET" && url.pathname === "/api/health") {
    send(res, 200, { ok: true, persist: "supabase" });
    return true;
  }

  if (url.pathname === "/api/seed" && (req.method === "GET" || req.method === "POST")) {
    const result = await seedUsers();
    send(res, result.ok ? 200 : 500, result);
    return true;
  }

  return false;
}
