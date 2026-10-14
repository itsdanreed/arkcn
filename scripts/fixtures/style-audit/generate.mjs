import { mkdirSync, readFileSync, writeFileSync, rmSync } from "node:fs"
import path from "node:path"

// Translate example composition only. Every styled reference part comes from
// the pinned upstream implementation, never from the component under test.
export function generateExamples(root, destination, names) {
  rmSync(path.join(destination, "examples"), { recursive: true, force: true })
  mkdirSync(path.join(destination, "examples"), { recursive: true })
  mkdirSync(path.join(destination, "adapters"), { recursive: true })
  writeFileSync(
    path.join(destination, "adapt.tsx"),
    `import * as React from "react"
export function adapt(Component: React.ElementType) {
  return function ExamplePart({asChild, children, ...props}: Record<string, any>) {
    return asChild && React.isValidElement(children) ? <Component {...props} render={children} /> : <Component {...props}>{children}</Component>
  }
}
`
  )
  const aliases = {
    Accordion: { ItemTrigger: "Trigger", ItemContent: "Content" },
    AlertDialog: { CloseTrigger: "Action" },
    Attachment: { ActionTrigger: "Action" },
    Carousel: { ItemGroup: "Content", PrevTrigger: "Previous", NextTrigger: "Next" },
    Chart: { Root: "Container" },
    Command: { Content: "List", ItemGroup: "Group" },
    ContextMenu: { ContextTrigger: "Trigger", ItemGroup: "Group", ItemGroupLabel: "Label" },
    Dialog: { CloseTrigger: "Close" },
    Direction: { Root: "Provider" },
    Drawer: { CloseTrigger: "Close" },
    DropdownMenu: { ItemGroup: "Group", ItemGroupLabel: "Label", RadioItemGroup: "RadioGroup" },
    InputGroup: { Trigger: "Button" },
    Menubar: { ItemGroup: "Group" },
    Resizable: { Root: "PanelGroup" },
    Select: { ItemGroup: "Group", ItemGroupLabel: "Label", ValueText: "Value" },
    Sheet: { CloseTrigger: "Close" },
  }
  for (const name of names) {
    const namespace = name
      .split("-")
      .map((s) => s[0].toUpperCase() + s.slice(1))
      .join("")
      .replace("InputOtp", "InputOTP")
    const source = readFileSync(path.join(destination, "ui", `${name}.tsx`), "utf8")
    const exported = [...source.matchAll(/export \{([^}]+)\}/gs)]
      .flatMap((m) => m[1].split(",").map((s) => s.trim()))
      .filter((s) => /^[A-Z]\w*$/.test(s))
    const parts = Object.fromEntries(
      exported.filter((s) => s.startsWith(namespace)).map((s) => [s.slice(namespace.length) || "Root", s])
    )
    for (const [key, suffix] of Object.entries(aliases[namespace] ?? {})) parts[key] = `${namespace}${suffix}`
    if (name === "button") {
      writeFileSync(
        path.join(destination, "adapters", `${name}.tsx`),
        `import * as Raw from "../ui/${name}"\nimport {adapt} from "../adapt"\nexport const Button = adapt(Raw.Button)\nexport * from "../ui/${name}"`
      )
    } else {
      writeFileSync(
        path.join(destination, "adapters", `${name}.tsx`),
        `import * as Raw from "../ui/${name}"\nimport {adapt} from "../adapt"\nexport const ${namespace} = {${Object.entries(
          parts
        )
          .map(([k, v]) => `${k}: adapt(Raw.${v})`)
          .join(",")}}\nexport * from "../ui/${name}"`
      )
    }
    let example = readFileSync(path.join(root, "docs/src/examples", `${name}.tsx`), "utf8")
      .replaceAll("@/components/ui/", "../adapters/")
      .replace(/ collapsible(?=[\s>])/g, "")
      .replaceAll(
        'import { Link } from "@docs/router"',
        'const Link = ({to, ...props}: React.ComponentProps<"a"> & {to: string}) => <a href={to} {...props} />'
      )
    if (name === "command") example = example.replaceAll('label="', 'heading="')
    if (name === "dropdown-menu")
      example = example.replace("onValueChange={({ value }) => setPosition(value)}", "onValueChange={setPosition}")
    writeFileSync(path.join(destination, "examples", `${name}.tsx`), example)
  }
}
