import { Fragment, useState } from "react"
import { Checkbox } from "../ui/checkbox"
import { SidebarMenuSubButton } from "../ui/sidebar"
import { InputGroup, InputGroupAddon, InputGroupInput } from "../ui/input-group"
import { Button } from "../ui/button"
import { SearchIcon, ChevronRightIcon, ChevronLeftIcon, ChevronsRightIcon, ChevronsLeftIcon } from "lucide-react"
const items = [
  { value: "read", label: "View records" },
  { value: "edit", label: "Edit records" },
  { value: "delete", label: "Delete records", disabled: true },
  { value: "export", label: "Export data" },
  { value: "billing", label: "Manage billing" },
  { value: "members", label: "Invite members" },
]
export default function Example() {
  const [granted, setGranted] = useState(["read", "export"])
  const [selected, setSelected] = useState<string[]>([])
  const [queries, setQueries] = useState({ source: "", target: "" })
  const sides = {
    source: items.filter((x) => !granted.includes(x.value)),
    target: items.filter((x) => granted.includes(x.value)),
  }
  const visible = {
    source: sides.source.filter((x) => x.label.toLowerCase().includes(queries.source.toLowerCase())),
    target: sides.target.filter((x) => x.label.toLowerCase().includes(queries.target.toLowerCase())),
  }
  const move = (right: boolean, all: boolean) => {
    const moving = visible[right ? "source" : "target"]
      .filter((x) => !x.disabled && (all || selected.includes(x.value)))
      .map((x) => x.value)
    setGranted((v) => (right ? [...v, ...moving] : v.filter((x) => !moving.includes(x))))
    setSelected((v) => v.filter((x) => !moving.includes(x)))
  }
  return (
    <div className="grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
      {(["source", "target"] as const).map((side, index) => {
        const enabled = visible[side].filter((x) => !x.disabled)
        const count = sides[side].filter((x) => selected.includes(x.value)).length
        const checked = enabled.filter((x) => selected.includes(x.value)).length
        return (
          <Fragment key={side}>
            {index === 1 && (
              <div className="flex items-center justify-center gap-1 sm:flex-col">
                {[
                  { right: true, all: true, Icon: ChevronsRightIcon },
                  { right: true, all: false, Icon: ChevronRightIcon },
                  { right: false, all: false, Icon: ChevronLeftIcon },
                  { right: false, all: true, Icon: ChevronsLeftIcon },
                ].map(({ right, all, Icon }) => {
                  const n = sides[right ? "source" : "target"].filter((x) => selected.includes(x.value)).length
                  return (
                    <Button
                      key={String(right) + all}
                      data-audit-move
                      variant="outline"
                      size="icon-sm"
                      className="rotate-90 sm:rotate-0"
                      disabled={all ? visible[right ? "source" : "target"].every((x) => x.disabled) : n === 0}
                      aria-label={
                        all ? `Move all ${right ? "right" : "left"}` : `Move ${n} selected ${right ? "right" : "left"}`
                      }
                      onClick={() => move(right, all)}
                    >
                      <Icon />
                    </Button>
                  )
                })}
              </div>
            )}
            <div
              data-side={side}
              className="flex h-80 min-w-0 flex-col overflow-hidden rounded-lg border border-input bg-background text-sm dark:bg-input/30"
            >
              <div className="flex h-9 shrink-0 items-center gap-2 border-b px-2.5">
                <Checkbox
                  data-audit-header
                  aria-label={`Select all ${side === "source" ? "available" : "selected"} items`}
                  disabled={!enabled.length}
                  checked={checked > 0 && checked === enabled.length}
                  indeterminate={checked > 0 && checked < enabled.length}
                  onCheckedChange={(v) =>
                    setSelected((prev) =>
                      v
                        ? [...new Set([...prev, ...enabled.map((x) => x.value)])]
                        : prev.filter((x) => !enabled.some((i) => i.value === x))
                    )
                  }
                />
                <span className="flex-1 truncate font-medium">{side === "source" ? "Available" : "Granted"}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {count ? `${count} / ${sides[side].length}` : sides[side].length}
                </span>
              </div>
              <InputGroup
                data-audit-search
                className="h-8 shrink-0 rounded-none border-0 border-b shadow-none has-focus-visible:ring-0"
              >
                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
                <InputGroupInput
                  aria-label={side === "source" ? "Filter available" : "Filter granted"}
                  placeholder="Filter"
                  value={queries[side]}
                  onChange={(e) => setQueries({ ...queries, [side]: e.target.value })}
                />
              </InputGroup>
              {visible[side].length ? (
                <div className="flex min-h-0 flex-1 flex-col gap-px overflow-auto p-1">
                  {visible[side].map((item) => (
                    <SidebarMenuSubButton
                      key={item.value}
                      render={<div role="option" tabIndex={0} />}
                      data-audit-row={item.value}
                      className="w-full shrink-0 translate-x-0"
                      aria-disabled={item.disabled || undefined}
                      isActive={selected.includes(item.value)}
                      onClick={() => {
                        if (!item.disabled)
                          setSelected((v) =>
                            v.includes(item.value) ? v.filter((x) => x !== item.value) : [...v, item.value]
                          )
                      }}
                    >
                      <Checkbox
                        aria-hidden
                        tabIndex={-1}
                        readOnly
                        checked={selected.includes(item.value)}
                        className="pointer-events-none"
                      />
                      <span>{item.label}</span>
                    </SidebarMenuSubButton>
                  ))}
                </div>
              ) : (
                <div className="flex flex-1 items-center justify-center px-4 py-6 text-center text-sm text-muted-foreground">
                  {queries[side] ? "No matches" : "Nothing here"}
                </div>
              )}
            </div>
          </Fragment>
        )
      })}
    </div>
  )
}
