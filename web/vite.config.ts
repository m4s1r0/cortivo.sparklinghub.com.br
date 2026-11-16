import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Portas fixas do ecossistema (ECO-002): API 3003, Vite 5177. strictPort: nunca cair em outra porta.
const API_ORIGEM = "http://127.0.0.1:3003";

export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("src", import.meta.url)),
    },
  },
  server: {
    host: "127.0.0.1",
    port: 5177,
    strictPort: true,
    proxy: { "/api": API_ORIGEM },
  },
  build: { outDir: "dist", emptyOutDir: true },
});
