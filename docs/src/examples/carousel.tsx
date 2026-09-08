import { Card } from "@/components/ui/card"
import { Carousel } from "@/components/ui/carousel"

export default function CarouselExample() {
  return (
    <div className="w-full px-10">
      <Carousel.Root className="mx-auto w-full max-w-xs">
        <Carousel.ItemGroup>
          {Array.from({ length: 5 }, (_, i) => (
            <Carousel.Item key={i}>
              <Card.Root>
                <Card.Content className="flex aspect-square items-center justify-center text-3xl font-semibold">
                  {i + 1}
                </Card.Content>
              </Card.Root>
            </Carousel.Item>
          ))}
        </Carousel.ItemGroup>
        <Carousel.PrevTrigger />
        <Carousel.NextTrigger />
      </Carousel.Root>
    </div>
  )
}
