import { Splitter } from "@/components/ui/splitter"
export default function SplitterExample() {
  return (
    <Splitter.Root
      panels={[
        { id: "left", minSize: "80px" },
        { id: "right", minSize: "80px" },
      ]}
      defaultSize={[50, 50]}
      className="h-48 w-full max-w-xl rounded-lg border"
    >
      <Splitter.Panel id="left">
        <div className="flex h-full items-center justify-center p-4">Left panel</div>
      </Splitter.Panel>
      <Splitter.ResizeTrigger id="left:right" aria-label="Resize panels">
        <Splitter.ResizeTriggerIndicator />
      </Splitter.ResizeTrigger>
      <Splitter.Panel id="right">
        <div className="flex h-full items-center justify-center p-4">Right panel</div>
      </Splitter.Panel>
    </Splitter.Root>
  )
}
