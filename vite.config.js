import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Any request starting with /api is forwarded to the FastAPI server.
export default defineConfig({
  plugins: [react()],
  // build: { outDir: "build" },
  server: { proxy: { "/api": "http://localhost:8000" } },
});
