import { handleApi } from "./app-api.mjs";

export function localApiPlugin() {
  return {
    name: "cwbp-local-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) {
          next();
          return;
        }
        try {
          const handled = await handleApi(req, res);
          if (!handled) next();
        } catch (error) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: error.message || "Server error" }));
        }
      });
    },
  };
}
