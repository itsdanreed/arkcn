import { useState } from "react"
import { Button } from "../ui/button"
import { SidebarMenuSubButton } from "../ui/sidebar"
import { ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
export default function Example() {
  const [rtl, setRtl] = useState(false)
  const [open, setOpen] = useState(true)
  const [selected, setSelected] = useState("")
  return (
    <div className="w-full max-w-sm space-y-4">
      <Button variant="outline" size="sm" aria-pressed={rtl} onClick={() => setRtl(!rtl)}>
        RTL
      </Button>
      <div dir={rtl ? "rtl" : "ltr"} className="flex flex-col gap-px">
        {["name: arkcn", "enabled: true"].map((label) => (
          <SidebarMenuSubButton
            key={label}
            size="sm"
            render={<button type="button" />}
            isActive={selected === label}
            onClick={() => setSelected(label)}
          >
            <span>{label}</span>
          </SidebarMenuSubButton>
        ))}
        <SidebarMenuSubButton
          size="sm"
          render={<button type="button" />}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <ChevronDownIcon /> : rtl ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          <span>options</span>
        </SidebarMenuSubButton>
        {open && (
          <div className="flex flex-col gap-px ps-4">
            {[
              "retries: 3",
              "missing: null",
              "description: A long JSON value that should stay on a single row without overlapping its neighbors.",
            ].map((label) => (
              <SidebarMenuSubButton
                key={label}
                size="sm"
                render={<button type="button" />}
                isActive={selected === label}
                onClick={() => setSelected(label)}
              >
                <span>{label}</span>
              </SidebarMenuSubButton>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
