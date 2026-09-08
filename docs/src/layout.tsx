import * as React from "react"
import { useTheme } from "next-themes"
import { MenuIcon, MoonIcon, SearchIcon, SunIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
import { Sheet } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { guides } from "./nav"
import { groupedComponents, title, version } from "./registry"
import { Link, useRouter } from "./router"

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 .5A11.5 11.5 0 0 0 .5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.17c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.8 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.26 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12 11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  )
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="flex size-6 items-center justify-center rounded-md bg-foreground text-xs font-bold text-background">
        a
      </span>
      arkcn
      <span className="rounded-md border px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">v{version}</span>
    </Link>
  )
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { path } = useRouter()
  const groups = React.useMemo(groupedComponents, [])
  const link = (to: string, label: string) => (
    <Link
      key={to}
      to={to}
      onClick={onNavigate}
      aria-current={path === to ? "page" : undefined}
      className={cn(
        "block rounded-md px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground aria-[current=page]:bg-muted aria-[current=page]:font-medium aria-[current=page]:text-foreground"
      )}
    >
      {label}
    </Link>
  )
  return (
    <nav className="flex flex-col gap-6 text-sm">
      <div>
        <h4 className="mb-1 px-2 text-sm font-semibold">Getting started</h4>
        {guides.map((g) => link(g.path, g.title))}
      </div>
      {groups.map((group) => (
        <div key={group.title}>
          <h4 className="mb-1 px-2 text-sm font-semibold">{group.title}</h4>
          {group.items.map((item) => link(`/docs/components/${item.name}`, title(item.name)))}
        </div>
      ))}
    </nav>
  )
}

function SearchDialog() {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const { navigate } = useRouter()
  const entries = React.useMemo(() => {
    const items = groupedComponents().flatMap((g) =>
      g.items.map((i) => ({
        label: title(i.name),
        hint: g.title,
        to: `/docs/components/${i.name}`,
        text: i.description,
      }))
    )
    return [...guides.map((g) => ({ label: g.title, hint: "Guide", to: g.path, text: "" })), ...items]
  }, [])
  const q = query.trim().toLowerCase()
  const hits = (q ? entries.filter((e) => `${e.label} ${e.text}`.toLowerCase().includes(q)) : entries).slice(0, 12)
  const [active, setActive] = React.useState(0)
  React.useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((o) => !o)
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])
  const go = (to: string) => {
    setOpen(false)
    setQuery("")
    navigate(to)
  }
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        aria-label="Search docs"
        className="w-8 justify-center gap-2 px-0 text-muted-foreground sm:w-56 sm:justify-start sm:px-2.5"
        onClick={() => setOpen(true)}
      >
        <SearchIcon /> <span className="hidden sm:inline">Search docs…</span>
        <Kbd.Root className="ml-auto hidden sm:inline-flex">⌘K</Kbd.Root>
      </Button>
      <Dialog.Root open={open} onOpenChange={({ open }) => setOpen(open)}>
        <Dialog.Content className="gap-0 p-0 sm:max-w-lg" showCloseButton={false}>
          <Dialog.Title className="sr-only">Search</Dialog.Title>
          <div className="border-b p-2">
            <Input.Root
              autoFocus
              placeholder="Search components and guides"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setActive(0)
              }}
              onKeyDown={(e) => {
                if (e.key === "ArrowDown") setActive((a) => Math.min(hits.length - 1, a + 1))
                else if (e.key === "ArrowUp") setActive((a) => Math.max(0, a - 1))
                else if (e.key === "Enter" && hits[active]) go(hits[active].to)
                else return
                e.preventDefault()
              }}
            />
          </div>
          <ul className="max-h-80 overflow-y-auto p-2" role="listbox">
            {hits.length === 0 && <li className="px-2 py-6 text-center text-sm text-muted-foreground">No results</li>}
            {hits.map((h, i) => (
              <li
                key={h.to}
                role="option"
                aria-selected={i === active}
                data-active={i === active ? "" : undefined}
                className="flex cursor-default items-center justify-between rounded-md px-2 py-1.5 text-sm data-active:bg-muted"
                onMouseEnter={() => setActive(i)}
                onClick={() => go(h.to)}
              >
                <span>{h.label}</span>
                <span className="text-xs text-muted-foreground">{h.hint}</span>
              </li>
            ))}
          </ul>
        </Dialog.Content>
      </Dialog.Root>
    </>
  )
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <SunIcon className="dark:hidden" />
      <MoonIcon className="hidden dark:block" />
    </Button>
  )
}

export function Layout({ children, outline }: { children: React.ReactNode; outline?: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = React.useState(false)
  const { path } = useRouter()
  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-screen-2xl items-center gap-4 px-4 md:px-6">
          <Sheet.Root open={menuOpen} onOpenChange={({ open }) => setMenuOpen(open)}>
            <Sheet.Trigger asChild>
              <Button variant="ghost" size="icon-sm" className="md:hidden" aria-label="Open menu">
                <MenuIcon />
              </Button>
            </Sheet.Trigger>
            <Sheet.Content side="left" className="w-72 overflow-y-auto p-4">
              <Sheet.Title className="sr-only">Navigation</Sheet.Title>
              <div className="mb-4">
                <Brand />
              </div>
              <SidebarNav onNavigate={() => setMenuOpen(false)} />
            </Sheet.Content>
          </Sheet.Root>
          <Brand />
          <nav className="hidden items-center gap-4 text-sm md:flex">
            <Link
              to="/docs"
              className={cn(
                "text-muted-foreground hover:text-foreground",
                path.startsWith("/docs") && !path.startsWith("/docs/components") && "text-foreground"
              )}
            >
              Docs
            </Link>
            <Link
              to="/docs/components"
              className={cn(
                "text-muted-foreground hover:text-foreground",
                path.startsWith("/docs/components") && "text-foreground"
              )}
            >
              Components
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <SearchDialog />
            <Button variant="ghost" size="icon-sm" asChild aria-label="GitHub">
              <a href="https://github.com/itsdanreed/arkcn" target="_blank" rel="noreferrer">
                <GithubIcon />
              </a>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div className="mx-auto flex max-w-screen-2xl px-4 md:px-6">
        <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-60 shrink-0 overflow-y-auto py-6 pr-4 md:block">
          <SidebarNav />
        </aside>
        <main data-slot="docs-content" className="min-w-0 flex-1 py-8 md:px-8">
          {children}
        </main>
        {outline && (
          <aside className="sticky top-14 hidden h-[calc(100svh-3.5rem)] w-56 shrink-0 overflow-y-auto py-8 xl:block">
            {outline}
          </aside>
        )}
      </div>
    </div>
  )
}

export function Outline({ items }: { items: { id: string; text: string; depth: number }[] }) {
  if (items.length === 0) return null
  return (
    <div className="text-sm">
      <h4 className="mb-2 font-semibold">On this page</h4>
      <ul className="flex flex-col gap-1">
        {items.map((i) => (
          <li key={i.id} className={cn(i.depth === 3 && "pl-3")}>
            <a href={`#${i.id}`} className="text-muted-foreground transition-colors hover:text-foreground">
              {i.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
