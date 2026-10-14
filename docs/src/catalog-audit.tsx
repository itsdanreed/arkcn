import { relatedPatterns, nonvisualControls } from "./audit-related-patterns"
import { setAuditMotionPreference } from "./audit-environment"
/** Isolated reference and implementation examples for the styling audit. */
import { Component, lazy, Suspense, useState, type ReactNode } from "react"
import { createRoot } from "react-dom/client"
import { FrameworkProvider } from "./framework"
import { RouterProvider } from "./router"
import { Sonner } from "@/components/ui/sonner"
import "./catalog-audit.css"

const current = import.meta.glob<{ default: React.ComponentType }>("./examples/*.tsx")
const auditExamples = import.meta.glob<{ default: React.ComponentType }>("./audit-examples/*.tsx")
const references = import.meta.glob("../.style-audit/examples/*.tsx")

type ReferenceOverride = { component: string; kind: "component" | "wrapper"; attribute: string; line: number }
const integrityFiles = import.meta.glob<{ default: { overrides: Record<string, ReferenceOverride[]> } }>(
  "../.style-audit/integrity.json",
  { eager: true }
)
const referenceOverrides = integrityFiles["../.style-audit/integrity.json"]?.default.overrides

const names = Object.keys(current)
  .map((key) =>
    key
      .split("/")
      .pop()!
      .replace(/\.tsx$/, "")
  )
  .sort()
const query = new URLSearchParams(location.search)
const initial = names.includes(query.get("component") ?? "") ? query.get("component")! : names[0]
document.documentElement.classList.toggle("dark", query.get("dark") === "true")
setAuditMotionPreference(query.get("reduced") === "true")

class Boundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null as string | null }
  static getDerivedStateFromError(error: Error) {
    return { error: error.message }
  }
  render() {
    return this.state.error ? <div role="alert">Render failed: {this.state.error}</div> : this.props.children
  }
}
const load = auditExamples[`./audit-examples/${initial}.tsx`] ?? current[`./examples/${initial}.tsx`]
const Control = load ? lazy(load) : null
function Example() {
  return (
    <main className="min-h-screen bg-background p-8 text-foreground" data-audit-example={initial}>
      <Boundary>
        <Suspense fallback={<div role="status">Loading example…</div>}>
          {Control ? (
            <FrameworkProvider>
              <RouterProvider value={{ path: "/", navigate: () => undefined }}>
                <Control />
                {initial === "sonner" && !auditExamples[`./audit-examples/${initial}.tsx`] && (
                  <Sonner.Root theme={query.get("dark") === "true" ? "dark" : "light"} />
                )}
              </RouterProvider>
            </FrameworkProvider>
          ) : (
            <div role="alert">No example is available.</div>
          )}
        </Suspense>
      </Boundary>
    </main>
  )
}
function Catalogue() {
  const [name, setName] = useState(initial)
  const [dark, setDark] = useState(query.get("dark") === "true")
  const [reduced, setReduced] = useState(query.get("reduced") !== "false")
  const related = relatedPatterns[name]
  const nonvisual = nonvisualControls[name]
  const overrides = referenceOverrides?.[name]
  const componentOverrides = overrides?.filter((item) => item.kind === "component") ?? []
  const hasReference = `../.style-audit/examples/${name}.tsx` in references
  function persist(key: string, value: string) {
    const url = new URL(location.href)
    url.searchParams.set(key, value)
    history.replaceState(null, "", url)
  }
  return (
    <main className="space-y-4 bg-background p-6 text-foreground">
      <h1 className="text-2xl font-medium">shadcn styling audit</h1>
      <p className="text-sm text-muted-foreground">
        Independent upstream components, Nova style, neutral theme.{" "}
        {
          Object.keys(references).filter(
            (key) =>
              !relatedPatterns[
                key
                  .split("/")
                  .pop()!
                  .replace(/\.tsx$/, "")
              ]
          ).length
        }{" "}
        direct counterparts / {names.length} components. {Object.keys(relatedPatterns).length} related-pattern
        comparisons. {Object.keys(nonvisualControls).length} helpers have no visible default styling. Separate
        stylesheets; reference fixture customizations are disclosed below.
      </p>
      <div className="flex flex-wrap items-center gap-6">
        <label>
          Component{" "}
          <select
            aria-label="Component"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              persist("component", e.target.value)
            }}
          >
            {names.map((name) => (
              <option key={name}>{name}</option>
            ))}
          </select>
        </label>
        <label>
          <input
            type="checkbox"
            checked={dark}
            onChange={(e) => {
              setDark(e.target.checked)
              document.documentElement.classList.toggle("dark", e.target.checked)
              persist("dark", String(e.target.checked))
            }}
          />{" "}
          Dark theme
        </label>
        <label>
          <input
            type="checkbox"
            checked={reduced}
            onChange={(e) => {
              setReduced(e.target.checked)
              persist("reduced", String(e.target.checked))
            }}
          />{" "}
          Reduced motion (simulated)
        </label>
        <span>
          {names.indexOf(name) + 1} / {names.length}
        </span>
      </div>
      <p className="text-sm">
        {hasReference ? (
          <a
            className="underline"
            href={`https://github.com/shadcn-ui/ui/blob/30a58d4498f270af1c1e981a7d78a15cf5740841/${related?.sourcePath ?? `apps/v4/registry/bases/base/ui/${related?.source ?? name}.tsx`}`}
            target="_blank"
            rel="noreferrer"
          >
            {related ? `Related shadcn pattern: ${related.label}` : "View pinned shadcn source"}
          </a>
        ) : nonvisual ? (
          `Source review: no visible default styling to compare. ${nonvisual} This is not a behavior or accessibility audit.`
        ) : (
          "No direct shadcn counterpart. Compare this extension against related input, button, menu, and layout patterns."
        )}
      </p>
      {hasReference && (
        <details className="rounded-lg border p-3 text-sm" key={name}>
          <summary className="cursor-pointer font-medium">
            {overrides
              ? `Reference fixture styling: ${componentOverrides.length} component overrides / prop spreads; ${overrides.length - componentOverrides.length} wrapper styles`
              : "Reference integrity metadata missing — run npm run audit:prepare"}
          </summary>
          <p className="mt-2 text-muted-foreground">
            Shadcn source components are pinned. The example customizations below can affect geometry, inherited styles,
            and states; matches involving them do not prove matching upstream defaults. Run npm run audit:check to
            verify the generated reference has not changed since preparation.
          </p>
          <ul className="mt-2 space-y-1">
            {overrides?.map((item, index) => (
              <li key={index} className="font-mono text-xs wrap-break-word">
                {item.kind} · {item.component} · line {item.line}: {item.attribute}
              </li>
            ))}
          </ul>
        </details>
      )}
      <div className={nonvisual ? "grid gap-4" : "grid grid-cols-2 gap-4"}>
        {(nonvisual ? (["current"] as const) : (["shadcn", "current"] as const)).map((renderer) => (
          <section key={renderer}>
            <h2 className="mb-3 font-medium">
              {renderer === "shadcn"
                ? related
                  ? "shadcn/ui · related pattern · Nova · 30a58d4"
                  : "shadcn/ui · Nova · 30a58d4"
                : "arkcn · React"}
            </h2>
            <iframe
              title={renderer}
              className="h-[640px] w-full rounded-lg border"
              src={`${renderer === "shadcn" ? "shadcn-reference.html" : "catalog-audit.html"}?component=${name}&renderer=${renderer}&dark=${dark}&reduced=${reduced}`}
            />
          </section>
        ))}
      </div>
    </main>
  )
}
const root = createRoot(document.getElementById("root")!)
root.render(query.has("renderer") ? <Example /> : <Catalogue />)
import.meta.hot?.dispose(() => root.unmount())
