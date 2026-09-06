import * as React from "react"
import { marked } from "marked"
import { highlight } from "./code"
import { cn } from "@/lib/utils"

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

const renderer = new marked.Renderer()
renderer.code = ({ text, lang }) => {
  const language = (lang || "tsx").split(/\s/)[0]
  return `<div class="not-prose group/code relative rounded-lg border bg-muted/40 text-sm dark:bg-muted/20"><pre class="docs-code m-0 overflow-x-auto p-4 font-mono text-[13px] leading-relaxed"><code class="language-${language}">${highlight(text, language)}</code></pre></div>`
}
renderer.heading = ({ text, depth }) => {
  const id = slug(text)
  return `<h${depth} id="${id}"><a href="#${id}" class="no-underline font-inherit text-inherit hover:underline">${text}</a></h${depth}>`
}
renderer.codespan = ({ text }) => `<code>${escapeHtml(text)}</code>`
marked.use({ renderer, gfm: true, breaks: false })

export function renderMarkdown(source: string) {
  return marked.parse(source, { async: false }) as string
}

/** Markdown rendered with typography styles; `##`/`###` headings get ids for the outline. */
export function Markdown({ source, className }: { source: string; className?: string }) {
  const html = React.useMemo(() => renderMarkdown(source), [source])
  return (
    <div
      data-slot="docs-markdown"
      className={cn(
        "docs-prose prose max-w-none prose-neutral dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-foreground prose-code:font-normal",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

/** Headings (h2/h3) found in the rendered page, for the "On this page" outline. Re-scans when `key` changes. */
export function useOutline(key: string) {
  const [items, setItems] = React.useState<{ id: string; text: string; depth: number }[]>([])
  React.useEffect(() => {
    const main = document.querySelector("[data-slot=docs-content]")
    const headings = main ? Array.from(main.querySelectorAll<HTMLHeadingElement>("h2[id], h3[id]")) : []
    setItems(headings.map((h) => ({ id: h.id, text: h.textContent ?? "", depth: h.tagName === "H2" ? 2 : 3 })))
  }, [key])
  return items
}
