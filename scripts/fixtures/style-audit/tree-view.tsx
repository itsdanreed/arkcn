import { useState } from "react"
import { SidebarMenuSubButton } from "../ui/sidebar"
import { Checkbox } from "../ui/checkbox"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { FileIcon } from "lucide-react"
export default function Example() {
  const [selected, setSelected] = useState("selected")
  const [editing, setEditing] = useState<string | null>(null)
  const [renamed, setRenamed] = useState("")
  return (
    <div className="w-72 max-w-full space-y-5 text-sm">
      <div>
        <Label className="mb-1">Files</Label>
        <div className="flex flex-col gap-px">
          {[
            { value: "default", label: "app.tsx" },
            { value: "selected", label: "index.css" },
            { value: "disabled", label: "Disabled file" },
          ].map((node) => (
            <SidebarMenuSubButton
              key={node.value}
              render={<button type="button" />}
              className="w-full translate-x-0 pl-6"
              data-audit-row={node.value}
              isActive={selected === node.value}
              disabled={node.value === "disabled"}
              onClick={() => setSelected(node.value)}
              onKeyDown={(e) => {
                if (e.key === "F2") {
                  e.preventDefault()
                  setEditing(node.value)
                }
              }}
            >
              <FileIcon />
              {editing === node.value ? (
                <Input
                  autoFocus
                  aria-label="Rename input"
                  defaultValue={node.label}
                  className="h-6 flex-1 px-1"
                  onBlur={(e) => {
                    setRenamed(e.target.value)
                    setEditing(null)
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation()
                    if (e.key === "Escape") setEditing(null)
                    if (e.key === "Enter") {
                      setRenamed(e.currentTarget.value)
                      setEditing(null)
                    }
                  }}
                />
              ) : (
                <span>{node.label}</span>
              )}
            </SidebarMenuSubButton>
          ))}
        </div>
      </div>
      <div>
        <Label className="mb-1">Checkboxes</Label>
        <div className="flex gap-4">
          <Checkbox data-audit-check="checked" aria-label="Checked" defaultChecked />
          <Checkbox data-audit-check="unchecked" aria-label="Unchecked" />
          <Checkbox data-audit-check="mixed" aria-label="Mixed" indeterminate />
        </div>
      </div>
      <output aria-label="Renamed file">{renamed}</output>
    </div>
  )
}
