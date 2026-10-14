import { useState } from "react"
import { HomeIcon, InboxIcon, SettingsIcon, PlusIcon, MoreHorizontalIcon } from "lucide-react"
import { Sidebar } from "../adapters/sidebar"
import { useAuditMotion } from "../../src/audit-motion"
export default function Example() {
  const [variant, setVariant] = useState<"sidebar" | "floating" | "inset">("sidebar")
  const [side, setSide] = useState<"left" | "right">("left")
  const [dir, setDir] = useState<"ltr" | "rtl">("ltr")
  const [mode, setMode] = useState<"icon" | "offcanvas" | "none">("icon")
  const { trace } = useAuditMotion('[data-slot="sidebar-gap"], [data-slot="sidebar-container"]', 260)
  return (
    <section data-audit-case="sidebar" dir={dir}>
      <Sidebar.Provider>
        <Sidebar.Root side={side} variant={variant} collapsible={mode} dir={dir}>
          <Sidebar.Header>
            <Sidebar.Input aria-label="Search navigation" placeholder="Search…" />
          </Sidebar.Header>
          <Sidebar.Content>
            <Sidebar.Group>
              <Sidebar.GroupLabel>Workspace</Sidebar.GroupLabel>
              <Sidebar.GroupAction aria-label="Add workspace">
                <PlusIcon />
              </Sidebar.GroupAction>
              <Sidebar.GroupContent>
                <Sidebar.Menu>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton isActive tooltip="Overview">
                      <HomeIcon />
                      <span>Overview</span>
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton size="sm" variant="outline">
                      <InboxIcon />
                      <span>Inbox</span>
                    </Sidebar.MenuButton>
                    <Sidebar.MenuBadge>12</Sidebar.MenuBadge>
                    <Sidebar.MenuSub>
                      <Sidebar.MenuSubItem>
                        <Sidebar.MenuSubButton href="#recent" isActive onClick={(e) => e.preventDefault()}>
                          Recent
                        </Sidebar.MenuSubButton>
                      </Sidebar.MenuSubItem>
                      <Sidebar.MenuSubItem>
                        <Sidebar.MenuSubButton href="#archived" size="sm" onClick={(e) => e.preventDefault()}>
                          Archived
                        </Sidebar.MenuSubButton>
                      </Sidebar.MenuSubItem>
                    </Sidebar.MenuSub>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton size="lg">
                      <SettingsIcon />
                      <span>Settings</span>
                    </Sidebar.MenuButton>
                    <Sidebar.MenuAction showOnHover aria-label="More settings">
                      <MoreHorizontalIcon />
                    </Sidebar.MenuAction>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton disabled>
                      <SettingsIcon />
                      <span>Disabled</span>
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                </Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>
          </Sidebar.Content>
          <Sidebar.Separator />
          <Sidebar.Footer>Personal workspace</Sidebar.Footer>
          <Sidebar.Rail />
        </Sidebar.Root>
        <Sidebar.Inset className="p-4">
          <Sidebar.Trigger />
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <label>
              Variant{" "}
              <select
                aria-label="Sidebar variant"
                value={variant}
                onChange={(e) => setVariant(e.target.value as typeof variant)}
              >
                {["sidebar", "floating", "inset"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
            <label>
              Side{" "}
              <select aria-label="Sidebar side" value={side} onChange={(e) => setSide(e.target.value as typeof side)}>
                <option>left</option>
                <option>right</option>
              </select>
            </label>
            <label>
              Direction{" "}
              <select aria-label="Sidebar direction" value={dir} onChange={(e) => setDir(e.target.value as typeof dir)}>
                <option>ltr</option>
                <option>rtl</option>
              </select>
            </label>
            <label>
              Collapse mode{" "}
              <select
                aria-label="Sidebar collapse mode"
                value={mode}
                onChange={(e) => setMode(e.target.value as typeof mode)}
              >
                {["icon", "offcanvas", "none"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </label>
          </div>
        </Sidebar.Inset>
      </Sidebar.Provider>
      <output hidden data-motion-trace>
        {trace}
      </output>
    </section>
  )
}
