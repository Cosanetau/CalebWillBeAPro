import { handleApi } from "../server/app-api.mjs";

function toNodeRequest(req) {
  return req;
}

export default async function handler(req, res) {
  req.url = req.url?.startsWith("/api/") ? req.url : `/api/state`;
  const handled = await handleApi(toNodeRequest(req), res);
  if (!handled) {
    res.statusCode = 404;
    res.end(JSON.stringify({ error: "Not found" }));
  }
}
