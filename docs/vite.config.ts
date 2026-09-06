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
  // Examples load lazily; pre-bundle their heavy deps so the dev server does not reload mid-visit.
  optimizeDeps: {
    include: [
      "react-day-picker",
      "input-otp",
      "recharts",
      "embla-carousel-react",
      "react-resizable-panels",
      "@tiptap/react",
      "@tiptap/starter-kit",
      "@atlaskit/pragmatic-drag-and-drop/element/adapter",
      "@atlaskit/pragmatic-drag-and-drop/combine",
      "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge",
      "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element",
    ],
  },
  build: { outDir: "dist", emptyOutDir: true },
})
