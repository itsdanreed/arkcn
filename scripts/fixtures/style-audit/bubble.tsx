import { Bubble } from "../adapters/bubble"
export default function Example() {
  return (
    <div className="space-y-6">
      {(["default", "secondary", "muted", "tinted", "outline", "ghost", "destructive"] as const).map((variant) => (
        <section data-audit-case={variant} key={variant}>
          <Bubble.Group>
            <Bubble.Root variant={variant}>
              <Bubble.Content>
                {variant}: A message that can wrap across multiple lines when space is limited.
              </Bubble.Content>
            </Bubble.Root>
            <Bubble.Root variant={variant} align="end">
              <Bubble.Content asChild>
                <button type="button">{variant} action</button>
              </Bubble.Content>
            </Bubble.Root>
          </Bubble.Group>
        </section>
      ))}
      <section data-audit-case="reactions">
        <Bubble.Group className="gap-10 py-4">
          {(["top", "bottom"] as const).flatMap((side) =>
            (["start", "end"] as const).map((align) => (
              <Bubble.Root key={side + align} align={align} variant="secondary">
                <Bubble.Content>
                  {side} {align} reactions
                </Bubble.Content>
                <Bubble.Reactions side={side} align={align}>
                  +1
                </Bubble.Reactions>
              </Bubble.Root>
            ))
          )}
        </Bubble.Group>
      </section>
    </div>
  )
}
