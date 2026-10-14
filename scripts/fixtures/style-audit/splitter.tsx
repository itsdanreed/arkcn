import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "../ui/resizable"
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
            <ResizablePanelGroup orientation={orientation} className="size-full max-w-lg rounded-lg border">
              <ResizablePanel defaultSize="40%" minSize="20%" className="flex items-center justify-center text-sm">
                Sidebar
              </ResizablePanel>
              <ResizableHandle
                withHandle
                disabled={disabled}
                aria-label={orientation + (disabled ? " disabled" : "") + " resize"}
              />
              <ResizablePanel minSize="20%" className="flex items-center justify-center text-sm">
                Content
              </ResizablePanel>
            </ResizablePanelGroup>
          </section>
        ))
      )}
    </div>
  )
}
