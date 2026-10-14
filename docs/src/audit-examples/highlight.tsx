import { useState } from "react"
import { Highlight } from "@/components/ui/highlight"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const text = "Components compose components and subcomponents."
export default function Example() {
  const [query, setQuery] = useState("components")
  return (
    <div className="w-full max-w-sm space-y-4">
      <p className="text-xs text-muted-foreground">
        Plain text reference; marks and query matching are arkcn extensions.
      </p>
      <div className="grid gap-2">
        <Label.Root htmlFor="highlight-query">Query</Label.Root>
        <Input.Root id="highlight-query" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      <section data-audit-case="first" className="space-y-1">
        <h3 className="text-xs font-medium text-muted-foreground">First match, case sensitive</h3>
        <p data-audit-text className="text-sm">
          <Highlight.Root query={query} text={text} />
        </p>
      </section>
      <section data-audit-case="all" className="space-y-1">
        <h3 className="text-xs font-medium text-muted-foreground">All matches, ignore case</h3>
        <p data-audit-text className="text-sm">
          <Highlight.Root query={query} text={text} matchAll ignoreCase />
        </p>
      </section>
      <section data-audit-case="whole" className="space-y-1">
        <h3 className="text-xs font-medium text-muted-foreground">Whole words, ignore case</h3>
        <p data-audit-text className="text-sm">
          <Highlight.Root query={query} text={text} matchAll ignoreCase exactMatch />
        </p>
      </section>
      <section data-audit-case="typography" className="space-y-1">
        <h3 className="text-xs font-medium text-muted-foreground">Inherited typography</h3>
        <p data-audit-text className="text-lg/7 font-semibold italic">
          <Highlight.Root query="components" text={text} matchAll ignoreCase />
        </p>
      </section>
      <section data-audit-case="literal" className="space-y-1">
        <h3 className="text-xs font-medium text-muted-foreground">Literal punctuation and multiple queries</h3>
        <p data-audit-text className="text-sm">
          <Highlight.Root query={[".*", "[ui]", "C++"]} text="Use .*, [ui], and C++ literally." />
        </p>
      </section>
      <section data-audit-case="rtl" className="space-y-1">
        <h3 className="text-xs font-medium text-muted-foreground">RTL text</h3>
        <p data-audit-text dir="rtl" className="text-sm">
          <Highlight.Root query="مكونات" text="مكونات قابلة للوصول مع مكونات مشتركة." matchAll />
        </p>
      </section>
    </div>
  )
}
