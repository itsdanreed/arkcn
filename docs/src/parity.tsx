/** Development fixture: real documentation examples, rendered side by side. */
import { lazy, Suspense, useState } from "react"
import { createRoot } from "react-dom/client"
import { NativeThemeProvider } from "@multicomma/arkcn-react-native/lib/theme"
import "./index.css"
const names = [
  "spinner",
  "switch",
  "checkbox",
  "radio-group",
  "skeleton",
  "tabs",
  "progress",
  "button",
  "input",
  "textarea",
  "badge",
  "card",
  "alert",
  "avatar",
  "toggle",
  "toggle-group",
  "accordion",
  "input-group",
  "button-group",
  "label",
  "aspect-ratio",
  "separator",
  "collapsible",
]
const webModules = import.meta.glob<{ default: React.ComponentType }>("./examples/*.tsx")
const nativeModules = import.meta.glob<{ default: React.ComponentType }>("./native-examples/*.tsx")
const examples = names.map((name) => ({
  name,
  Web: lazy(webModules[`./examples/${name}.tsx`]),
  Native: lazy(nativeModules[`./native-examples/${name}.tsx`]),
}))
function Parity() {
  const [dark, setDark] = useState(true)
  const [reduced, setReduced] = useState(false)
  // eslint-disable-next-line better-tailwindcss/no-unknown-classes
  return (
    <div className={dark ? ["dark"].join("") : ""}>
      <main className="min-h-screen bg-background p-5 text-foreground sm:p-8" data-reduced-motion={reduced}>
        <h1 className="mb-4 text-2xl font-medium">Framework parity</h1>
        <div className="mb-6 flex gap-6">
          <label>
            <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} /> Dark theme
          </label>
          <label>
            <input type="checkbox" checked={reduced} onChange={(e) => setReduced(e.target.checked)} /> Reduced motion
          </label>
        </div>
        <div className="hidden grid-cols-2 gap-x-8 sm:grid">
          <h2>React</h2>
          <h2>React Native</h2>
        </div>
        {examples.map(({ name, Web, Native }) => (
          <section key={name} data-component={name} className="mt-6">
            <h3 className="mb-2 text-xs text-muted-foreground">{name}</h3>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
              <div
                data-renderer="react"
                role="group"
                aria-label="React example"
                className="flex min-h-24 items-center justify-center rounded-lg border p-6"
              >
                <Suspense fallback="Loading…">
                  <Web />
                </Suspense>
              </div>
              <div
                data-renderer="react-native"
                role="group"
                aria-label="React Native example"
                className="flex min-h-24 items-center justify-center rounded-lg border p-6"
              >
                <NativeThemeProvider colorScheme={dark ? "dark" : "light"} reducedMotion={reduced}>
                  <Suspense fallback="Loading…">
                    <Native />
                  </Suspense>
                </NativeThemeProvider>
              </div>
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
const root = createRoot(document.getElementById("root")!)
root.render(<Parity />)
import.meta.hot?.dispose(() => root.unmount())
