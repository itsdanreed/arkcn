import { Splitter } from "@/components/ui/splitter"
export default function Example() {
  return (
    <div className="space-y-6">
      {(["horizontal", "vertical"] as const).flatMap((orientation) =>
        [false, true].map((disabled) => (
          <section
            data-audit-case={orientation + (disabled ? "-disabled" : "")}
            key={orientation + disabled}
            style={{ height: 144 }}
          >
            <Splitter.Root
              orientation={orientation}
              panels={[
                { id: "left", minSize: 20 },
                { id: "right", minSize: 20 },
              ]}
              defaultSize={[40, 60]}
              className="size-full max-w-lg rounded-lg border"
            >
              <Splitter.Panel id="left" className="flex items-center justify-center text-sm">
                Sidebar
              </Splitter.Panel>
              <Splitter.ResizeTrigger
                id="left:right"
                disabled={disabled}
                aria-label={orientation + (disabled ? " disabled" : "") + " resize"}
              >
                <Splitter.ResizeTriggerIndicator />
              </Splitter.ResizeTrigger>
              <Splitter.Panel id="right" className="flex items-center justify-center text-sm">
                Content
              </Splitter.Panel>
            </Splitter.Root>
          </section>
        ))
      )}
    </div>
  )
}
