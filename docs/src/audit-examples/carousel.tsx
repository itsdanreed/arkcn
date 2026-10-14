import { Carousel } from "@/components/ui/carousel"
import { useAuditCarouselMotion } from "../audit-carousel-motion"
function Case({ orientation, dir }: { orientation: "horizontal" | "vertical"; dir: "ltr" | "rtl" }) {
  const { setApi, trace } = useAuditCarouselMotion()
  return (
    <section data-audit-case={orientation + "-" + dir} dir={dir} style={{ padding: 56 }}>
      <Carousel.Root
        orientation={orientation}
        opts={{ direction: dir }}
        setApi={setApi}
        className="mx-auto w-full max-w-64"
      >
        <Carousel.ItemGroup className={orientation === "vertical" ? "h-40" : ""}>
          {[1, 2, 3].map((n) => (
            <Carousel.Item key={n}>
              <div className="flex h-36 items-center justify-center rounded-lg border text-2xl">{n}</div>
            </Carousel.Item>
          ))}
        </Carousel.ItemGroup>
        <Carousel.PrevTrigger />
        <Carousel.NextTrigger />
      </Carousel.Root>
      <output hidden data-carousel-trace>
        {trace}
      </output>
    </section>
  )
}
export default function Example() {
  return (
    <div>
      {(["horizontal", "vertical"] as const).flatMap((orientation) =>
        (["ltr", "rtl"] as const).map((dir) => <Case key={orientation + dir} orientation={orientation} dir={dir} />)
      )}
    </div>
  )
}
