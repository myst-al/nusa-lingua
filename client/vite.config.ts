import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],

  // Vite load .env dari folder INI (root project) — bukan dari client/
  // Path relatif terhadap lokasi vite.config.ts.
  envDir: path.resolve(__dirname, ".."),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
  server: {
    port: 6101,
    proxy: {
      "/api": {
        target: "http://localhost:6100",
        changeOrigin: true,
      },
    },
  },
});
