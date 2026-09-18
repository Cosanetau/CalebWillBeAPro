import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { localApiPlugin } from "./server/vite-plugin.js";

export default defineConfig({
  plugins: [react(), localApiPlugin()],
  test: {
    environment: "node",
    include: ["src/**/*.test.js"],
  },
});
