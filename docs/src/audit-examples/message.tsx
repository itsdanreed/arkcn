import { Message } from "@/components/ui/message"
import { Bubble } from "@/components/ui/bubble"
export default function Example() {
  return (
    <div className="space-y-6">
      {(["ltr", "rtl"] as const).map((dir) => (
        <section dir={dir} data-audit-case={dir} key={dir}>
          <Message.Group>
            {(["start", "end"] as const).flatMap((align) =>
              (["secondary", "ghost"] as const).map((variant) => (
                <Message.Root key={align + variant} align={align}>
                  <Message.Avatar>
                    <span className="flex size-8 items-center justify-center">AC</span>
                  </Message.Avatar>
                  <Message.Content>
                    <Message.Header>Ava Chen</Message.Header>
                    <Bubble.Root variant={variant}>
                      <Bubble.Content>
                        A long message with enough words to wrap at narrow widths and show content alignment.
                      </Bubble.Content>
                    </Bubble.Root>
                    <Message.Footer>9:12 AM · Delivered</Message.Footer>
                  </Message.Content>
                </Message.Root>
              ))
            )}
            <Message.Root>
              <Message.Avatar>
                <span className="flex size-8 items-center justify-center">JD</span>
              </Message.Avatar>
              <Message.Content>
                <Bubble.Root>
                  <Bubble.Content>No header or footer</Bubble.Content>
                </Bubble.Root>
              </Message.Content>
            </Message.Root>
          </Message.Group>
        </section>
      ))}
    </div>
  )
}
