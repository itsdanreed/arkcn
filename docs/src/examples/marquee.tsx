import { Marquee } from "@/components/ui/marquee"

const logos = ["Acme", "Globex", "Initech", "Umbrella", "Hooli", "Stark"]

export default function MarqueeExample() {
  return (
    <Marquee.Root className="w-full max-w-lg">
      <Marquee.Viewport>
        <Marquee.Content>
          {logos.map((l) => (
            <Marquee.Item key={l} className="px-6 text-lg font-semibold text-muted-foreground">
              {l}
            </Marquee.Item>
          ))}
        </Marquee.Content>
      </Marquee.Viewport>
      <Marquee.Edge side="start" />
      <Marquee.Edge side="end" />
    </Marquee.Root>
  )
}
