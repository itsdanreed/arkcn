import { useState } from "react"
import { Input } from "../ui/input"
import { Label } from "../ui/label"

const text = "Components compose components and subcomponents."
export default function Example() {
  const [query, setQuery] = useState("components")
  return (
    <div className="w-full max-w-sm space-y-4">
      <p className="text-xs text-muted-foreground">
        Plain text reference; marks and query matching are arkcn extensions.
      </p>
      <div className="grid gap-2">
        <Label htmlFor="highlight-query">Query</Label>
        <Input id="highlight-query" value={query} onChange={(event) => setQuery(event.target.value)} />
      </div>
      {[
        ["first", "First match, case sensitive"],
        ["all", "All matches, ignore case"],
        ["whole", "Whole words, ignore case"],
      ].map(([id, label]) => (
        <section key={id} data-audit-case={id} className="space-y-1">
          <h3 className="text-xs font-medium text-muted-foreground">{label}</h3>
          <p data-audit-text className="text-sm">
            {text}
          </p>
        </section>
      ))}
      <section data-audit-case="typography" className="space-y-1">
        <h3 className="text-xs font-medium text-muted-foreground">Inherited typography</h3>
        <p data-audit-text className="text-lg/7 font-semibold italic">
          {text}
        </p>
      </section>
      <section data-audit-case="literal" className="space-y-1">
        <h3 className="text-xs font-medium text-muted-foreground">Literal punctuation and multiple queries</h3>
        <p data-audit-text className="text-sm">
          Use .*, [ui], and C++ literally.
        </p>
      </section>
      <section data-audit-case="rtl" className="space-y-1">
        <h3 className="text-xs font-medium text-muted-foreground">RTL text</h3>
        <p data-audit-text dir="rtl" className="text-sm">
          مكونات قابلة للوصول مع مكونات مشتركة.
        </p>
      </section>
    </div>
  )
}
