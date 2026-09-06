import * as React from "react"
import { ArrowRightIcon, ExternalLinkIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeBlock } from "./code"
import { Markdown, useOutline } from "./markdown"
import { Outline } from "./layout"
import { guideByPath } from "./nav"
import { groupedComponents, loadItem, registry, title, type RegistryItem } from "./registry"
import { Link } from "./router"
import { descriptions } from "./descriptions"

const guideModules = import.meta.glob<string>("../content/*.md", { query: "?raw", import: "default", eager: true })
const exampleModules = import.meta.glob<{ default: React.ComponentType }>("./examples/*.tsx")
const exampleSources = import.meta.glob<string>("./examples/*.tsx", { query: "?raw", import: "default" })

export function PageTitle({
  heading,
  description,
  children,
}: {
  heading: string
  description?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col gap-2">
      <h1 className="text-3xl font-bold tracking-tight">{heading}</h1>
      {description && <p className="text-lg text-muted-foreground">{description}</p>}
      {children}
    </div>
  )
}

/* -------------------------------- guides -------------------------------- */

export function GuidePage({ path }: { path: string }) {
  const guide = guideByPath(path)
  const source = guide ? guideModules[`../content/${guide.slug}.md`] : undefined
  const outline = useOutline(path)
  if (!guide || !source) return <NotFound />
  return (
    <WithOutline outline={outline}>
      <Markdown source={source} />
    </WithOutline>
  )
}

function WithOutline({ outline, children }: { outline: ReturnType<typeof useOutline>; children: React.ReactNode }) {
  return (
    <>
      {children}
      <OutlinePortal items={outline} />
    </>
  )
}

const OutlineContext = React.createContext<(node: React.ReactNode) => void>(() => {})
export const OutlineProvider = OutlineContext.Provider
function OutlinePortal({ items }: { items: ReturnType<typeof useOutline> }) {
  const set = React.useContext(OutlineContext)
  React.useEffect(() => {
    set(<Outline items={items} />)
    return () => set(null)
  }, [items, set])
  return null
}

/* ------------------------------- components ------------------------------ */

export function ComponentsIndex() {
  const groups = React.useMemo(groupedComponents, [])
  return (
    <>
      <PageTitle
        heading="Components"
        description={`${registry.items.filter((i) => i.type === "ui").length} components, every part exported, styled through Ark UI's data attributes.`}
      />
      <div className="flex flex-col gap-10">
        {groups.map((group) => (
          <section key={group.title}>
            <h2 className="mb-3 text-lg font-semibold">{group.title}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {group.items.map((item) => (
                <Link
                  key={item.name}
                  to={`/docs/components/${item.name}`}
                  className="flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <span className="font-medium">{title(item.name)}</span>
                  <span className="line-clamp-2 text-sm text-muted-foreground">
                    {item.description || `${item.exports.length} parts`}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  )
}

function ComponentPreview({ name }: { name: string }) {
  const key = `./examples/${name}.tsx`
  const [Example, setExample] = React.useState<React.ComponentType | null>(null)
  const [source, setSource] = React.useState<string>("")
  React.useEffect(() => {
    let cancelled = false
    const load = exampleModules[key]
    if (!load) return
    Promise.all([load(), exampleSources[key]()]).then(([mod, src]) => {
      if (cancelled) return
      setExample(() => mod.default)
      setSource(src)
    })
    return () => {
      cancelled = true
    }
  }, [key])
  if (!exampleModules[key]) return null
  return (
    <Tabs defaultValue="preview" className="mb-8">
      <TabsList variant="line">
        <TabsTrigger value="preview">Preview</TabsTrigger>
        <TabsTrigger value="code">Code</TabsTrigger>
      </TabsList>
      <TabsContent value="preview">
        <div data-slot="docs-preview" className="flex min-h-72 items-center justify-center rounded-lg border p-8">
          {Example ? <Example /> : <span className="text-sm text-muted-foreground">Loading…</span>}
        </div>
      </TabsContent>
      <TabsContent value="code">
        <CodeBlock code={source} maxHeight={480} />
      </TabsContent>
    </Tabs>
  )
}

function usageSnippet(item: RegistryItem) {
  const parts = item.exports.filter((e) => /^[A-Z]/.test(e))
  const first = parts[0] ?? title(item.name).replace(/\s/g, "")
  const importLine = `import { ${parts.slice(0, 8).join(", ")}${parts.length > 8 ? ", …" : ""} } from "@/components/ui/${item.name}"`
  return `${importLine}\n\nexport function Example() {\n  return <${first} />\n}`
}

export function ComponentPage({ name }: { name: string }) {
  const [item, setItem] = React.useState<RegistryItem | null | undefined>(undefined)
  React.useEffect(() => {
    let cancelled = false
    setItem(undefined)
    loadItem(name).then((i) => {
      if (!cancelled) setItem(i)
    })
    return () => {
      cancelled = true
    }
  }, [name])
  const outline = useOutline(item ? `${name}:loaded` : name)
  if (item === undefined) return <p className="text-sm text-muted-foreground">Loading…</p>
  if (!item) return <NotFound />
  const entry = registry.items.find((i) => i.name === name)
  const arkSlug = item.ark ? item.ark.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase() : null
  const parts = item.exports.filter((e) => /^[A-Z]/.test(e))
  const helpers = item.exports.filter((e) => !/^[A-Z]/.test(e))
  return (
    <WithOutline outline={outline}>
      <PageTitle heading={title(name)} description={descriptions[name] ?? item.description ?? undefined}>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {arkSlug && (
            <Button variant="outline" size="xs" asChild>
              <a href={`https://ark-ui.com/docs/components/${arkSlug}`} target="_blank" rel="noreferrer">
                Ark UI {item.ark} <ExternalLinkIcon />
              </a>
            </Button>
          )}
          {item.css && <Badge variant="secondary">ships CSS</Badge>}
          {Object.keys(item.dependencies)
            .filter((d) => !["@ark-ui/react", "lucide-react", "class-variance-authority"].includes(d))
            .map((d) => (
              <Badge key={d} variant="outline">
                {d}
              </Badge>
            ))}
        </div>
      </PageTitle>

      <ComponentPreview name={name} />

      <div className="docs-prose prose max-w-none prose-neutral dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight">
        <h2 id="installation">Installation</h2>
        <CodeBlock code={`npx @multicomma/arkcn add ${name}`} lang="bash" className="not-prose" />
        {item.registryDependencies.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Also installs{" "}
            {item.registryDependencies.map((d) => (
              <React.Fragment key={d}>
                <Link to={`/docs/components/${d}`} className="font-medium text-foreground">
                  {d}
                </Link>{" "}
              </React.Fragment>
            ))}
          </p>
        )}

        <h2 id="usage">Usage</h2>
        <CodeBlock code={usageSnippet(item)} className="not-prose" />

        <h2 id="anatomy">Anatomy</h2>
        <p>
          Every part is exported on its own and carries a <code>data-slot</code> attribute you can target in CSS.
        </p>
        <div className="not-prose flex flex-wrap gap-1.5">
          {parts.map((p) => (
            <code key={p} className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">
              {p}
            </code>
          ))}
        </div>
        {helpers.length > 0 && (
          <>
            <h3 id="helpers">Helpers</h3>
            <div className="not-prose flex flex-wrap gap-1.5">
              {helpers.map((p) => (
                <code key={p} className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">
                  {p}
                </code>
              ))}
            </div>
          </>
        )}

        {item.docs && (
          <>
            <h2 id="reference">Reference</h2>
            <Markdown source={item.docs.replace(/^## .*\n/, "")} />
          </>
        )}

        <h2 id="source">Source</h2>
        <p className="text-sm text-muted-foreground">
          {item.files.map((f) => f.path).join(", ")} — {entry?.files.length ?? 1} file,{" "}
          {item.files[0].content.split("\n").length} lines.
        </p>
        <CodeBlock code={item.files[0].content} maxHeight={520} className="not-prose" />
      </div>
    </WithOutline>
  )
}

/* --------------------------------- home --------------------------------- */

export function Home() {
  const count = registry.items.filter((i) => i.type === "ui").length
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-start gap-6 py-10">
      <Badge variant="secondary">v{registry.version}</Badge>
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Build with Ark UI. Ship like shadcn.</h1>
      <p className="max-w-xl text-lg text-muted-foreground">
        {count} components ported from shadcn/ui to Ark UI, plus the data-heavy primitives a real product needs: data
        grid, kanban, gantt, scheduler, node graph, rich text, query builder. Copied into your project, yours to change.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link to="/docs/installation">
            Get started <ArrowRightIcon />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/docs/components">Browse components</Link>
        </Button>
      </div>
      <CodeBlock
        code={"npx @multicomma/arkcn init\nnpx @multicomma/arkcn add button data-grid kanban"}
        lang="bash"
        className="w-full"
      />
    </div>
  )
}

export function NotFound() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">
        <Link to="/docs" className="underline underline-offset-4">
          Back to the docs
        </Link>
      </p>
    </div>
  )
}
