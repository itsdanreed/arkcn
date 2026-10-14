import { setAuditMotionPreference } from "./audit-environment"
import { Component, lazy, Suspense, type ReactNode } from "react"
import { createRoot } from "react-dom/client"
import "../.style-audit/reference.css"

const examples = import.meta.glob<{ default: React.ComponentType }>("../.style-audit/examples/*.tsx")
const query = new URLSearchParams(location.search)
const name = query.get("component") ?? "button"
const load = examples[`../.style-audit/examples/${name}.tsx`]
const Example = load ? lazy(load) : null
document.documentElement.className = `style-nova ${query.get("dark") === "true" ? "dark" : ""}`
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
const root = createRoot(document.getElementById("root")!)
root.render(
  <main className="min-h-screen p-8" data-audit-example={name}>
    <Boundary>
      <Suspense fallback={<div role="status">Loading example…</div>}>
        {Example ? (
          <Example />
        ) : (
          <p>No direct shadcn component. Audit this extension against the matching shadcn control patterns.</p>
        )}
      </Suspense>
    </Boundary>
  </main>
)
import.meta.hot?.dispose(() => root.unmount())
