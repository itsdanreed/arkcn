import { useState } from "react"
import { Button } from "../ui/button"
import { DocsTableOfContents } from "../ui/docs-toc"

const toc = [
  { url: "#installation", title: "Installation", depth: 2 },
  { url: "#configuration", title: "Configuration", depth: 3 },
  { url: "#advanced", title: "Advanced options", depth: 4 },
  { url: "#usage", title: "Usage with a long section heading that wraps", depth: 2 },
]
export default function Example() {
  const [rtl, setRtl] = useState(false)
  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" aria-pressed={rtl} onClick={() => setRtl(!rtl)}>
          RTL
        </Button>
      </div>
      <div dir={rtl ? "rtl" : "ltr"} className="grid grid-cols-2 items-start gap-4">
        <div className="sticky top-4 min-w-0">
          <DocsTableOfContents toc={toc} />
        </div>
        <article className="pb-[100svh]">
          {toc.map((item) => (
            <section key={item.url} className="min-h-80">
              <h2 id={item.url.slice(1)} className="text-sm font-medium">
                {item.title}
              </h2>
            </section>
          ))}
        </article>
      </div>
    </div>
  )
}
