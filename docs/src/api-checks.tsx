import * as React from "react"
import { createRoot } from "react-dom/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Field } from "@/components/ui/field"
import { Switch, useSwitch } from "@/components/ui/switch"
import { Accordion, useAccordion } from "@/components/ui/accordion"
import { Slider } from "@/components/ui/slider"
import "./index.css"

function Checks() {
  const parentRef = React.useRef<HTMLButtonElement>(null)
  const childRef = React.useRef<HTMLButtonElement>(null)
  const [parentClicks, setParentClicks] = React.useState(0)
  const [childClicks, setChildClicks] = React.useState(0)
  const [refsMatch, setRefsMatch] = React.useState(false)
  const switchApi = useSwitch({ defaultChecked: false })
  const accordion = useAccordion({ collapsible: true })
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-6 p-8">
      <h1 className="text-2xl font-semibold">Component API checks</h1>
      <Card.Root asChild className="tracking-tight">
        <article className="font-medium" data-testid="card">
          <Card.Content>Custom article root</Card.Content>
        </article>
      </Card.Root>
      <Button
        asChild
        ref={parentRef}
        className="tracking-wide"
        onClick={() => {
          setParentClicks((value) => value + 1)
          setRefsMatch(parentRef.current === childRef.current && parentRef.current?.tagName === "BUTTON")
        }}
      >
        <button ref={childRef} className="font-semibold" onClick={() => setChildClicks((value) => value + 1)}>
          Test merged events and refs
        </button>
      </Button>
      <output aria-live="polite">
        Parent: {parentClicks}; child: {childClicks}; refs: {refsMatch ? "match" : "pending"}
      </output>
      <Switch.RootProvider value={switchApi} asChild>
        <div>
          <Switch.Label>Provider switch</Switch.Label>
          <Switch.Control asChild>
            <span>
              <Switch.Thumb />
            </span>
          </Switch.Control>
          <Switch.HiddenInput />
        </div>
      </Switch.RootProvider>
      <output aria-live="polite">Provider checked: {String(switchApi.checked)}</output>
      <Accordion.RootProvider value={accordion} asChild>
        <section>
          <Accordion.Item value="details">
            <Accordion.ItemTrigger asChild>
              <button>Provider details</button>
            </Accordion.ItemTrigger>
            <Accordion.ItemContent asChild>
              <div>Provider content</div>
            </Accordion.ItemContent>
          </Accordion.Item>
        </section>
      </Accordion.RootProvider>
      <Field.Root invalid required>
        <Field.Label>Custom input</Field.Label>
        <Field.Input asChild>
          <input placeholder="Enter a value" />
        </Field.Input>
        <Field.HelperText>Associated help</Field.HelperText>
        <Field.ErrorText>Associated error</Field.ErrorText>
      </Field.Root>
      <Slider.Root defaultValue={[30]}>
        <Slider.Label>Custom thumb</Slider.Label>
        <Slider.Control>
          <Slider.Track>
            <Slider.Range />
          </Slider.Track>
          <Slider.Thumb index={0} asChild>
            <span>
              <Slider.HiddenInput />
            </span>
          </Slider.Thumb>
        </Slider.Control>
        <Slider.ValueText />
      </Slider.Root>
    </main>
  )
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Checks />
  </React.StrictMode>
)
