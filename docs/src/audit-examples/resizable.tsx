import { Resizable } from "@/components/ui/resizable"
export default function Example() {
  return (
    <div className="space-y-6">
      {(["horizontal", "vertical"] as const).map((orientation) => (
        <section data-audit-case={orientation} key={orientation} style={{ height: 192 }}>
          <Resizable.Root orientation={orientation} className="size-full max-w-lg rounded-lg border">
            <Resizable.Panel defaultSize="40%" minSize="20%" className="flex items-center justify-center text-sm">
              Sidebar
            </Resizable.Panel>
            <Resizable.Handle withHandle aria-label={orientation + " resize"} />
            <Resizable.Panel minSize="20%" className="flex items-center justify-center text-sm">
              Content
            </Resizable.Panel>
          </Resizable.Root>
        </section>
      ))}
    </div>
  )
}
