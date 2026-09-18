import { handleApi } from "../server/app-api.mjs";

export default async function handler(req, res) {
  req.url = req.url?.startsWith("/api/") ? req.url : "/api/seed";
  const handled = await handleApi(req, res);
  if (!handled) {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Not found" }));
  }
}
