import { Separator } from "../adapters/separator"
export default function Example() {
  return (
    <div className="space-y-6">
      <section data-audit-case="horizontal" className="space-y-4">
        <p>Before</p>
        <Separator.Root />
        <p>After</p>
      </section>
      <section data-audit-case="vertical" className="flex h-16 items-stretch gap-4">
        <span>Before</span>
        <Separator.Root orientation="vertical" />
        <span>After</span>
      </section>
      <section data-audit-case="custom" className="flex h-16 items-stretch gap-4">
        <Separator.Root orientation="vertical" className="w-1 bg-primary" />
        <Separator.Root className="h-1 bg-primary" />
      </section>
    </div>
  )
}
