import { useAuditMotion } from "../audit-motion"
import { Accordion } from "@/components/ui/accordion"
export default function Example() {
  const motion = useAuditMotion()
  return (
    <section data-audit-case="accordion" className="max-w-xl">
      <Accordion.Root defaultValue={["open"]} collapsible>
        <Accordion.Item value="open">
          <Accordion.ItemTrigger>Open section</Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <p>First paragraph.</p>
            <p>
              Second paragraph with <a href="#example">a link</a>.
            </p>
          </Accordion.ItemContent>
        </Accordion.Item>
        <Accordion.Item value="closed">
          <Accordion.ItemTrigger>Closed section</Accordion.ItemTrigger>
          <Accordion.ItemContent>
            <p>A short panel.</p>
          </Accordion.ItemContent>
        </Accordion.Item>
        <Accordion.Item value="disabled" disabled>
          <Accordion.ItemTrigger>Disabled section</Accordion.ItemTrigger>
          <Accordion.ItemContent>Unavailable.</Accordion.ItemContent>
        </Accordion.Item>
      </Accordion.Root>
      <output data-motion-trace={motion.trace} className="mt-4 block text-xs text-muted-foreground">
        Open or close a section to sample its animation.
      </output>
    </section>
  )
}
