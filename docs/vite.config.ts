import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// Docs site, served from multicomma.com/arkcn. Components come straight from ../src.
export default defineConfig({
  root: __dirname,
  base: "/arkcn/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@docs": path.resolve(__dirname, "./src"),
      "@": path.resolve(__dirname, "../src"),
    },
  },
  build: { outDir: "dist", emptyOutDir: true },
})
