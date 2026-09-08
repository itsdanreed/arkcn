import assert from "node:assert/strict"
import { registerHooks } from "node:module"
import { readFileSync, existsSync } from "node:fs"
import { fileURLToPath, pathToFileURL } from "node:url"
import ts from "typescript"
import React from "react"
import { renderToStaticMarkup } from "react-dom/server"

const root = new URL("../", import.meta.url)
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/")) {
      const base = fileURLToPath(new URL(`src/${specifier.slice(2)}`, root))
      const file = [base, `${base}.tsx`, `${base}.ts`].find(existsSync)
      if (!file) throw new Error(`Cannot resolve ${specifier}`)
      return { url: pathToFileURL(file).href, shortCircuit: true }
    }
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (/\.tsx?$/.test(url) && !url.includes("node_modules")) {
      const source = ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2023 },
      }).outputText
      return { format: "module", source, shortCircuit: true }
    }
    return nextLoad(url, context)
  },
})
const { Card } = await import("../src/components/ui/card.tsx")
const { Button } = await import("../src/components/ui/button.tsx")
const { Input } = await import("../src/components/ui/input.tsx")
const { Accordion } = await import("../src/components/ui/accordion.tsx")
const { Switch } = await import("../src/components/ui/switch.tsx")
const { Field } = await import("../src/components/ui/field.tsx")
const { Fieldset } = await import("../src/components/ui/fieldset.tsx")
const { TransferList } = await import("../src/components/ui/transfer-list.tsx")
const { AppShell } = await import("../src/components/ui/app-shell.tsx")
const { DownloadTrigger } = await import("../src/components/ui/download-trigger.tsx")
const h = React.createElement
const render = (component, props, child) => renderToStaticMarkup(h(component, props, child))
assert.equal(typeof Card, "object")
assert.equal(Card.Root.name, "CardRoot")
assert.equal(Accordion.ItemTrigger.name, "AccordionItemTrigger")
assert.equal(AppShell.NotificationItem.name, "AppShellNotificationItem")
assert.equal(typeof Button, "function")
assert.equal("Root" in Button, false)
const download = render(
  DownloadTrigger.Root,
  { asChild: true, data: "report", fileName: "report.txt", mimeType: "text/plain" },
  h(Button, null, "Download")
)
const plainButton = render(Button, {}, "Download")
assert.equal(download.match(/class="([^"]*)"/)?.[1], plainButton.match(/class="([^"]*)"/)?.[1])
assert.equal((download.match(/<button/g) ?? []).length, 1)
const card = render(
  Card.Root,
  { asChild: true, className: "outer", "data-test": "card" },
  h("article", { className: "inner" }, "Content")
)
assert.match(card, /^<article/)
assert.match(card, /outer inner/)
assert.match(card, /data-slot="card"/)
assert.match(card, /data-test="card"/)
const link = render(Button, { asChild: true, variant: "outline" }, h("a", { href: "#target" }, "Open"))
assert.match(link, /^<a/)
assert.doesNotMatch(link, /<button/)
assert.match(link, /href="#target"/)
const input = render(Input.Root, { asChild: true, defaultValue: "Alex" }, h("input", { "aria-label": "Name" }))
assert.match(input, /value="Alex"/)
assert.doesNotMatch(input, /asChild/)
const switchMarkup = render(Switch.Root, { defaultChecked: true }, [
  h(Switch.Control, { key: "control", asChild: true }, h("span", null, h(Switch.Thumb))),
  h(Switch.HiddenInput, { key: "input", name: "notifications" }),
])
assert.match(switchMarkup, /data-state="checked"/)
assert.match(switchMarkup, /data-size="default"/)
assert.match(switchMarkup, /name="notifications"/)
assert.match(switchMarkup, /<span[^>]*data-part="control"/)
const notification = render(
  AppShell.NotificationItem,
  { asChild: true, unread: true },
  h("button", { type: "button", className: "custom-notification" }, "New message")
)
assert.match(notification, /^<li[^>]*><button/)
assert.match(notification, /<button[^>]*data-slot="app-shell-notification-item-surface"/)
assert.match(notification, /<button[^>]*data-unread=""/)
assert.match(
  notification,
  /<button[^>]*class="[^"]*group\/notification[^"]*flex[^"]*text-start[^"]*custom-notification/
)
const field = render(
  Field.Root,
  { id: "email", ids: { helperText: "help", errorText: "error" }, invalid: true, required: true },
  [
    h(Field.Label, { key: "label" }, "Email"),
    h(Field.Input, { key: "input" }),
    h(Field.HelperText, { key: "help" }, "Work email"),
    h(Field.ErrorText, { key: "error" }, "Invalid email"),
  ]
)
assert.match(field, /for="email"/)
assert.match(field, /aria-invalid="true"/)
assert.match(field, /required=""/)
const disabled = render(Fieldset.Root, { disabled: true }, h(Field.Root, null, h(Field.Input)))
assert.match(disabled, /disabled=""/)
const accordion = render(
  Accordion.Root,
  { asChild: true },
  h(
    "section",
    null,
    h(Accordion.Item, { value: "one" }, [
      h(Accordion.ItemTrigger, { key: "trigger", asChild: true }, h("button", null, "Open")),
      h(Accordion.ItemContent, { key: "content" }, "Body"),
    ])
  )
)
assert.match(accordion, /^<section/)
assert.doesNotMatch(accordion, /<button[^>]*>.*<button/)
const transfer = render(
  TransferList.Root,
  { items: [{ value: "read", label: "Read" }] },
  h(
    TransferList.Panel,
    { side: "source" },
    h(TransferList.Items, { asChild: true }, h("section", { "data-test": "custom-list" }, "Custom rows"))
  )
)
assert.match(transfer, /<section[^>]*data-test="custom-list"/)
assert.match(transfer, /<section[^>]*role="listbox"/)
assert.match(transfer, /Custom rows/)
console.log(
  "test-components: namespace APIs, custom elements, merged attributes, field semantics, and composed Ark controls pass"
)
