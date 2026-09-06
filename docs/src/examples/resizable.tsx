import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"

export default function ResizableExample() {
  return (
    <ResizablePanelGroup orientation="horizontal" className="h-48 w-full max-w-lg rounded-lg border">
      <ResizablePanel defaultSize={40} className="flex items-center justify-center text-sm">
        Sidebar
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel className="flex items-center justify-center text-sm">Content</ResizablePanel>
    </ResizablePanelGroup>
  )
}
