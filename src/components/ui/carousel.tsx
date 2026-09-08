import { ark } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react"

import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

type CarouselApi = UseEmblaCarouselType[1]
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>
type CarouselOptions = UseCarouselParameters[0]
type CarouselPlugin = UseCarouselParameters[1]

type CarouselProps = {
  /** Embla carousel options. */
  opts?: CarouselOptions
  /** Embla plugins. */
  plugins?: CarouselPlugin
  orientation?: "horizontal" | "vertical"
  /** Receives the Embla API once the carousel mounts. */
  setApi?: (api: CarouselApi) => void
}

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0]
  api: ReturnType<typeof useEmblaCarousel>[1]
  scrollPrev: () => void
  scrollNext: () => void
  canScrollPrev: boolean
  canScrollNext: boolean
} & CarouselProps

const CarouselContext = React.createContext<CarouselContextProps | null>(null)

function useCarousel() {
  const context = React.useContext(CarouselContext)

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />")
  }

  return context
}

function CarouselRoot({
  orientation = "horizontal",
  opts,
  setApi,
  plugins,
  className,
  children,
  ...props
}: CarouselRootProps) {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  )
  const [canScrollPrev, setCanScrollPrev] = React.useState(false)
  const [canScrollNext, setCanScrollNext] = React.useState(false)

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [])

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev()
  }, [api])

  const scrollNext = React.useCallback(() => {
    api?.scrollNext()
  }, [api])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault()
        scrollPrev()
      } else if (event.key === "ArrowRight") {
        event.preventDefault()
        scrollNext()
      }
    },
    [scrollPrev, scrollNext]
  )

  React.useEffect(() => {
    if (!api || !setApi) return
    setApi(api)
  }, [api, setApi])

  React.useEffect(() => {
    if (!api) return
    onSelect(api)
    api.on("reInit", onSelect)
    api.on("select", onSelect)

    return () => {
      api?.off("select", onSelect)
    }
  }, [api, onSelect])

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <ark.div
        onKeyDownCapture={handleKeyDown}
        className={cn("relative", className)}
        role="region"
        aria-roledescription="carousel"
        data-slot="carousel"
        {...props}
      >
        {children}
      </ark.div>
    </CarouselContext.Provider>
  )
}

function CarouselItemGroup({ className, ...props }: CarouselItemGroupProps) {
  const { carouselRef, orientation } = useCarousel()

  return (
    <div ref={carouselRef} className="overflow-hidden" data-slot="carousel-content">
      <ark.div
        className={cn("flex", orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col", className)}
        {...props}
      />
    </div>
  )
}

function CarouselItem({ className, ...props }: CarouselItemProps) {
  const { orientation } = useCarousel()

  return (
    <ark.div
      role="group"
      aria-roledescription="slide"
      data-slot="carousel-item"
      className={cn("min-w-0 shrink-0 grow-0 basis-full", orientation === "horizontal" ? "pl-4" : "pt-4", className)}
      {...props}
    />
  )
}

function CarouselPrevTrigger({
  className,
  variant = "outline",
  size = "icon-sm",
  asChild,
  children,
  ...props
}: CarouselPrevTriggerProps) {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel()

  return (
    <Button
      data-slot="carousel-previous"
      variant={variant}
      size={size}
      className={cn(
        "absolute touch-manipulation rounded-full",
        orientation === "horizontal" ? "inset-y-0 -left-12 my-auto" : "-top-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      asChild={asChild}
      {...props}
    >
      {asChild
        ? children
        : (children ?? (
            <>
              <ChevronLeftIcon />
              <span className="sr-only">Previous slide</span>
            </>
          ))}
    </Button>
  )
}

function CarouselNextTrigger({
  className,
  variant = "outline",
  size = "icon-sm",
  asChild,
  children,
  ...props
}: CarouselNextTriggerProps) {
  const { orientation, scrollNext, canScrollNext } = useCarousel()

  return (
    <Button
      data-slot="carousel-next"
      variant={variant}
      size={size}
      className={cn(
        "absolute touch-manipulation rounded-full",
        orientation === "horizontal" ? "inset-y-0 -right-12 my-auto" : "-bottom-12 left-1/2 -translate-x-1/2 rotate-90",
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      asChild={asChild}
      {...props}
    >
      {asChild
        ? children
        : (children ?? (
            <>
              <ChevronRightIcon />
              <span className="sr-only">Next slide</span>
            </>
          ))}
    </Button>
  )
}

type CarouselRootProps = React.ComponentProps<typeof ark.div> & CarouselProps

type CarouselItemGroupProps = React.ComponentProps<typeof ark.div>

type CarouselItemProps = React.ComponentProps<typeof ark.div>

type CarouselPrevTriggerProps = React.ComponentProps<typeof Button>

type CarouselNextTriggerProps = React.ComponentProps<typeof Button>

const Carousel = {
  Root: CarouselRoot,
  ItemGroup: CarouselItemGroup,
  Item: CarouselItem,
  PrevTrigger: CarouselPrevTrigger,
  NextTrigger: CarouselNextTrigger,
}

export {
  type CarouselApi,
  Carousel,
  useCarousel,
  type CarouselRootProps,
  type CarouselItemGroupProps,
  type CarouselItemProps,
  type CarouselPrevTriggerProps,
  type CarouselNextTriggerProps,
}
