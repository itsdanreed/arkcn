import { Resizable } from "@/components/ui/resizable"

export default function ResizableExample() {
  return (
    <Resizable.Root orientation="horizontal" className="h-48 w-full max-w-lg rounded-lg border">
      <Resizable.Panel defaultSize={40} className="flex items-center justify-center text-sm">
        Sidebar
      </Resizable.Panel>
      <Resizable.Handle withHandle />
      <Resizable.Panel className="flex items-center justify-center text-sm">Content</Resizable.Panel>
    </Resizable.Root>
  )
}
