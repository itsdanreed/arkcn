import path from "node:path"
import { existsSync } from "node:fs"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// Expo's global shim contains only ambient declarations. Rolldown otherwise
// retains its type imports as runtime exports when bundling Expo modules for web.
const expoGlobalTypes = () => ({
  name: "expo-global-types",
  enforce: "pre" as const,
  transform(_source: string, id: string) {
    if (id.split("?")[0].endsWith("/expo-modules-core/src/ts-declarations/global.ts"))
      return { code: "export {}", map: null }
  },
})

// Docs site, served from multicomma.com/arkcn. Components come straight from ../packages/react/src.
export default defineConfig(({ command }) => ({
  define: { global: "globalThis", __DEV__: JSON.stringify(command === "serve"), "process.env.EXPO_OS": '"web"' },
  root: __dirname,
  base: "/arkcn/",
  plugins: [expoGlobalTypes(), react(), tailwindcss()],
  resolve: {
    dedupe: ["react", "react-dom", "expo-modules-core"],
    extensions: [".web.tsx", ".web.ts", ".web.jsx", ".web.js", ".mjs", ".js", ".ts", ".tsx", ".json"],
    alias: {
      "@react-native/assets-registry/registry": "react-native-web/dist/modules/AssetRegistry",
      "react-native": "react-native-web",
      "react-native-svg": path.resolve(__dirname, "../node_modules/react-native-svg/src/index.ts"),
      "@docs": path.resolve(__dirname, "./src"),
      "@": path.resolve(__dirname, "../packages/react/src"),
    },
  },
  // Examples load lazily; pre-bundle their heavy deps so the dev server does not reload mid-visit.
  optimizeDeps: {
    entries: [
      "index.html",
      "catalog-audit.html",
      "state-audit.html",
      "parity.html",
      ...(existsSync(path.resolve(__dirname, ".style-audit/reference.css")) ? ["shadcn-reference.html"] : []),
    ],
    rolldownOptions: {
      plugins: [expoGlobalTypes()],
      resolve: { extensions: [".web.tsx", ".web.ts", ".web.jsx", ".web.js", ".mjs", ".js", ".ts", ".tsx", ".json"] },
    },
    include: [
      "expo-clipboard",
      "expo-modules-core",
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
}))
