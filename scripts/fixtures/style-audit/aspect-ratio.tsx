import { AspectRatio } from "../adapters/aspect-ratio"
export default function Example() {
  return (
    <div className="grid grid-cols-2 items-start gap-4 md:grid-cols-3">
      {([1, 16 / 9, 4 / 3, 3 / 4] as const).map((ratio) => (
        <section key={ratio} data-audit-case={String(ratio)}>
          <AspectRatio.Root ratio={ratio} className="overflow-hidden rounded-lg border bg-muted">
            <div className="absolute inset-0 flex items-center justify-center text-sm">{ratio.toFixed(2)} ratio</div>
          </AspectRatio.Root>
        </section>
      ))}
      <section data-audit-case="constrained">
        <AspectRatio.Root ratio={16 / 9} className="w-40 rounded-lg border bg-muted p-3">
          Constrained width
        </AspectRatio.Root>
      </section>
      <section data-audit-case="content">
        <AspectRatio.Root ratio={4 / 3} className="rounded-lg border bg-muted p-3">
          <div className="h-64">Tall content</div>
        </AspectRatio.Root>
      </section>
    </div>
  )
}
