import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"
import Prism from "prismjs"
import "prismjs/components/prism-jsx"
import "prismjs/components/prism-typescript"
import "prismjs/components/prism-tsx"
import "prismjs/components/prism-bash"
import "prismjs/components/prism-json"
import "prismjs/components/prism-css"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function highlight(code: string, lang: string) {
  const grammar = Prism.languages[lang] ?? Prism.languages.tsx
  return Prism.highlight(code, grammar, lang)
}

export function CopyTrigger({ text, className }: { text: string; className?: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label="Copy code"
      className={cn("text-muted-foreground hover:text-foreground", className)}
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        })
      }}
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  )
}

/** A highlighted code block with a copy button. `lang`: tsx, bash, json, css. */
export function CodeBlock({
  code,
  lang = "tsx",
  className,
  maxHeight,
}: {
  code: string
  lang?: string
  className?: string
  maxHeight?: number | string
}) {
  const html = React.useMemo(() => highlight(code.trimEnd(), lang), [code, lang])
  return (
    <div
      data-slot="docs-code-block"
      className={cn("group/code relative rounded-lg border bg-muted/40 text-sm dark:bg-muted/20", className)}
    >
      <CopyTrigger
        text={code}
        className="absolute top-2 right-2 opacity-0 transition-opacity group-hover/code:opacity-100"
      />
      <pre className="docs-code m-0 overflow-x-auto p-4 font-mono text-[13px] leading-relaxed" style={{ maxHeight }}>
        <code className={`language-${lang}`} dangerouslySetInnerHTML={{ __html: html }} />
      </pre>
    </div>
  )
}
