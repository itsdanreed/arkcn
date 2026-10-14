import { useEffect, useState } from "react"
import type { EmblaCarouselType } from "embla-carousel"

/** Record Embla's actual scroll samples; both renderers use this observer. */
export function useAuditCarouselMotion() {
  const [api, setApi] = useState<EmblaCarouselType>()
  const [trace, setTrace] = useState("")
  useEffect(() => {
    if (!api) return
    let samples: { time: number; progress: number; transform: string }[] = []
    let start = 0
    const scroll = () => {
      if (!samples.length) start = performance.now()
      samples.push({
        time: performance.now() - start,
        progress: api.scrollProgress(),
        transform: api.containerNode().style.transform,
      })
    }
    const settle = () => {
      setTrace(JSON.stringify(samples))
      samples = []
    }
    api.on("scroll", scroll).on("settle", settle)
    return () => {
      api.off("scroll", scroll).off("settle", settle)
    }
  }, [api])
  return { setApi, trace }
}
