import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { apiMiddleware, uploadsMiddleware } from "./server/api.js";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "pergolafr-api",
      configureServer(server) {
        server.middlewares.use(uploadsMiddleware());
        server.middlewares.use(apiMiddleware());
      },
      configurePreviewServer(server) {
        server.middlewares.use(uploadsMiddleware());
        server.middlewares.use(apiMiddleware());
      },
    },
  ],
});
