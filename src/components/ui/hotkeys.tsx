"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Kbd, KbdGroup } from "@/components/ui/kbd"

/* -------------------------------- parsing -------------------------------- */

const isMac = () => typeof navigator !== "undefined" && /mac|iphone|ipad|ipod/i.test(navigator.platform)

type Chord = { key: string; mod: boolean; ctrl: boolean; meta: boolean; alt: boolean; shift: boolean }

const keyAliases: Record<string, string> = {
  esc: "escape",
  return: "enter",
  space: " ",
  up: "arrowup",
  down: "arrowdown",
  left: "arrowleft",
  right: "arrowright",
  plus: "+",
  del: "delete",
}

/** "mod+shift+k" → chord; "g d" → sequence of chords. */
function parseHotkey(hotkey: string): Chord[] {
  return hotkey
    .trim()
    .split(/\s+/)
    .map((part) => {
      const tokens = part.split("+").map((t) => t.toLowerCase())
      // "+" itself is written as "plus"
      const key = tokens.pop() ?? ""
      const chord: Chord = {
        key: keyAliases[key] ?? key,
        mod: false,
        ctrl: false,
        meta: false,
        alt: false,
        shift: false,
      }
      for (const t of tokens) {
        if (t === "mod" || t === "cmd" || t === "command") chord.mod = true
        else if (t === "ctrl" || t === "control") chord.ctrl = true
        else if (t === "meta" || t === "win" || t === "super") chord.meta = true
        else if (t === "alt" || t === "option") chord.alt = true
        else if (t === "shift") chord.shift = true
      }
      return chord
    })
}

function matchesChord(event: KeyboardEvent, chord: Chord, mac: boolean) {
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key.toLowerCase()
  if (key !== chord.key) return false
  const wantMeta = chord.meta || (chord.mod && mac)
  const wantCtrl = chord.ctrl || (chord.mod && !mac)
  if (event.metaKey !== wantMeta || event.ctrlKey !== wantCtrl || event.altKey !== chord.alt) return false
  // Punctuation like "?" already implies Shift on most layouts, so only enforce Shift for letters.
  const letter = /^[a-z0-9]$/.test(chord.key) || chord.key.length > 1
  if (letter && event.shiftKey !== chord.shift) return false
  return true
}

const symbol: Record<string, string> = {
  mod: "⌘",
  meta: "⌘",
  ctrl: "⌃",
  alt: "⌥",
  shift: "⇧",
  enter: "↵",
  escape: "Esc",
  backspace: "⌫",
  delete: "⌦",
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
  " ": "Space",
  tab: "Tab",
}
const winSymbol: Record<string, string> = {
  ...symbol,
  mod: "Ctrl",
  meta: "Win",
  ctrl: "Ctrl",
  alt: "Alt",
  shift: "Shift",
}

/** Platform-aware key labels: "mod+k" → ["⌘", "K"] on Mac, ["Ctrl", "K"] elsewhere. Sequences give one array per chord. */
function formatHotkey(hotkey: string, mac = isMac()): string[][] {
  const table = mac ? symbol : winSymbol
  return parseHotkey(hotkey).map((chord) => {
    const parts: string[] = []
    if (chord.ctrl) parts.push(table.ctrl)
    if (chord.alt) parts.push(table.alt)
    if (chord.shift) parts.push(table.shift)
    if (chord.mod) parts.push(table.mod)
    if (chord.meta && !chord.mod) parts.push(table.meta)
    parts.push(table[chord.key] ?? (chord.key.length === 1 ? chord.key.toUpperCase() : chord.key))
    return parts
  })
}

/* -------------------------------- registry ------------------------------- */

type HotkeyEntry = {
  id: string
  /** Key combination such as `mod+k`, or a sequence such as `g d`. */
  hotkey: string
  label: string
  group: string
  enabled: boolean
  /** Fire even while typing in an input, textarea, or contenteditable. */
  allowInInput: boolean
  handler: (event: KeyboardEvent) => void
}

type HotkeysContextValue = {
  entries: HotkeyEntry[]
  register: (entry: HotkeyEntry) => () => void
  dialogOpen: boolean
  setDialogOpen: (open: boolean) => void
}

const HotkeysContext = React.createContext<HotkeysContextValue | null>(null)

function useHotkeysContext() {
  const ctx = React.useContext(HotkeysContext)
  if (!ctx) throw new Error("Hotkeys parts must be used inside <HotkeysProvider>")
  return ctx
}

const isEditable = (target: EventTarget | null) => {
  const el = target as HTMLElement | null
  if (!el || !("tagName" in el)) return false
  const tag = el.tagName
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || el.isContentEditable
}

/**
 * One document-level keydown listener for every registered hotkey. Supports chords
 * ("mod+k"), sequences ("g d", one second between keys), and a built-in "?" that opens
 * `HotkeysDialog` when one is rendered.
 */
function HotkeysProvider({
  children,
  dialogHotkey = "?",
  sequenceTimeout = 1000,
}: {
  children: React.ReactNode
  /** Opens the shortcuts dialog; `null` disables it. */
  dialogHotkey?: string | null
  /** Milliseconds allowed between keys of a sequence. */
  sequenceTimeout?: number
}) {
  const [entries, setEntries] = React.useState<HotkeyEntry[]>([])
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const entriesRef = React.useRef(entries)
  entriesRef.current = entries
  const buffer = React.useRef<{ keys: KeyboardEvent[]; at: number }>({ keys: [], at: 0 })

  const register = React.useCallback((entry: HotkeyEntry) => {
    setEntries((prev) => [...prev.filter((e) => e.id !== entry.id), entry])
    return () => setEntries((prev) => prev.filter((e) => e.id !== entry.id))
  }, [])

  const mac = React.useMemo(isMac, [])
  React.useEffect(() => {
    const down = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return
      if (["Shift", "Control", "Alt", "Meta"].includes(event.key)) return
      const editing = isEditable(event.target)
      const now = Date.now()
      const buf = buffer.current
      if (now - buf.at > sequenceTimeout) buf.keys = []
      buf.keys.push(event)
      buf.at = now
      if (buf.keys.length > 4) buf.keys.shift()

      const candidates = [...entriesRef.current]
      if (dialogHotkey) {
        candidates.push({
          id: "hotkeys:dialog",
          hotkey: dialogHotkey,
          label: "Keyboard shortcuts",
          group: "General",
          enabled: true,
          allowInInput: false,
          handler: () => setDialogOpen((open) => !open),
        })
      }
      let partial = false
      for (const entry of candidates) {
        if (!entry.enabled || (editing && !entry.allowInInput)) continue
        const chords = parseHotkey(entry.hotkey)
        const tail = buf.keys.slice(-chords.length)
        if (tail.length === chords.length && chords.every((c, i) => matchesChord(tail[i], c, mac))) {
          event.preventDefault()
          buf.keys = []
          entry.handler(event)
          return
        }
        // Is the buffer a prefix of a longer sequence? Then keep it.
        if (chords.length > 1 && buf.keys.length < chords.length) {
          const head = chords.slice(0, buf.keys.length)
          if (head.every((c, i) => matchesChord(buf.keys[i], c, mac))) partial = true
        }
      }
      if (!partial) buf.keys = []
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [dialogHotkey, sequenceTimeout, mac])

  const ctx = React.useMemo<HotkeysContextValue>(
    () => ({ entries, register, dialogOpen, setDialogOpen }),
    [entries, register, dialogOpen]
  )
  return <HotkeysContext.Provider value={ctx}>{children}</HotkeysContext.Provider>
}

/** Register a hotkey for the lifetime of the component. Listed in `HotkeysDialog` when it has a label. */
function useHotkey(
  /** Key combination such as `mod+k`, or a sequence such as `g d`. */
  hotkey: string,
  handler: (event: KeyboardEvent) => void,
  options: { label?: string; group?: string; enabled?: boolean; allowInInput?: boolean } = {}
) {
  const { register } = useHotkeysContext()
  const { label = "", group = "General", enabled = true, allowInInput = false } = options
  const id = React.useId()
  const handlerRef = React.useRef(handler)
  handlerRef.current = handler
  React.useEffect(
    () =>
      register({
        id,
        hotkey,
        label,
        group,
        enabled,
        allowInInput,
        handler: (event) => handlerRef.current(event),
      }),
    [register, id, hotkey, label, group, enabled, allowInInput]
  )
}

/** Every registered hotkey with a label, grouped, for rendering a cheat sheet. */
function useHotkeys() {
  const { entries } = useHotkeysContext()
  return React.useMemo(() => {
    const groups = new Map<string, HotkeyEntry[]>()
    for (const e of entries) {
      if (!e.label) continue
      const list = groups.get(e.group) ?? []
      list.push(e)
      groups.set(e.group, list)
    }
    return Array.from(groups, ([group, hotkeys]) => ({ group, hotkeys }))
  }, [entries])
}

/* ---------------------------------- parts -------------------------------- */

/** Renders a hotkey as Kbd caps ("mod+k" → ⌘ K; "g d" → G then D). */
function HotkeyKbd({ hotkey, className, ...props }: React.ComponentProps<"span"> & { hotkey: string }) {
  const chords = formatHotkey(hotkey)
  return (
    <span data-slot="hotkey-kbd" className={cn("inline-flex items-center gap-1", className)} {...props}>
      {chords.map((keys, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="text-xs text-muted-foreground">then</span>}
          <KbdGroup>
            {keys.map((k, j) => (
              <Kbd key={j}>{k}</Kbd>
            ))}
          </KbdGroup>
        </React.Fragment>
      ))}
    </span>
  )
}

/** The shortcuts cheat sheet. Opens from the provider's `dialogHotkey` ("?" by default) or `useHotkeysDialog()`. */
function HotkeysDialog({
  title = "Keyboard shortcuts",
  description = "Shortcuts work anywhere on the page except while typing.",
  children,
  className,
}: {
  title?: React.ReactNode
  description?: React.ReactNode
  children?: React.ReactNode
  className?: string
}) {
  const { dialogOpen, setDialogOpen } = useHotkeysContext()
  const registered = useHotkeys()
  const groups = React.useMemo(() => {
    const self = { id: "hotkeys:dialog", hotkey: "?", label: "Show this dialog" }
    const general = registered.find((g) => g.group === "General")
    if (general) return registered.map((g) => (g === general ? { ...g, hotkeys: [...g.hotkeys, self] } : g))
    return [...registered, { group: "General", hotkeys: [self] }]
  }, [registered])
  return (
    <Dialog open={dialogOpen} onOpenChange={({ open }) => setDialogOpen(open)}>
      <DialogContent data-slot="hotkeys-dialog" className={cn("sm:max-w-lg", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 sm:grid-cols-2">
          {groups.map(({ group, hotkeys }) => (
            <div key={group} data-slot="hotkeys-dialog-group" className="flex flex-col gap-1.5">
              <h4 className="text-xs font-medium text-muted-foreground uppercase">{group}</h4>
              {hotkeys.map((h) => (
                <div
                  key={h.id}
                  data-slot="hotkeys-dialog-item"
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span className="truncate">{h.label}</span>
                  <HotkeyKbd hotkey={h.hotkey} />
                </div>
              ))}
            </div>
          ))}
        </div>
        {children}
      </DialogContent>
    </Dialog>
  )
}

function useHotkeysDialog() {
  const { dialogOpen, setDialogOpen } = useHotkeysContext()
  return { open: dialogOpen, setOpen: setDialogOpen }
}

export { HotkeyKbd, HotkeysDialog, HotkeysProvider, formatHotkey, parseHotkey, useHotkey, useHotkeys, useHotkeysDialog }
