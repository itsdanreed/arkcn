import { Marquee, MarqueeContent, MarqueeEdge, MarqueeItem, MarqueeViewport } from "@/components/ui/marquee"

const logos = ["Acme", "Globex", "Initech", "Umbrella", "Hooli", "Stark"]

export default function MarqueeExample() {
  return (
    <Marquee className="w-full max-w-lg">
      <MarqueeViewport>
        <MarqueeContent>
          {logos.map((l) => (
            <MarqueeItem key={l} className="px-6 text-lg font-semibold text-muted-foreground">
              {l}
            </MarqueeItem>
          ))}
        </MarqueeContent>
      </MarqueeViewport>
      <MarqueeEdge side="start" />
      <MarqueeEdge side="end" />
    </Marquee>
  )
}
