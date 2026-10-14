import { useCallback, useEffect, useRef, useState } from "react"

/** Observe real CSS animation/transition frames without changing the component under audit. */
export function useAuditMotion(selector = '[data-slot="accordion-content"]', duration = 280) {
  const [trace, setTrace] = useState("")
  const pending = useRef(0)
  useEffect(() => () => cancelAnimationFrame(pending.current), [])
  const record = useCallback(
    (element: Element, animation: string) => {
      if (!element.matches(selector)) return
      if (pending.current) return
      const animations = element.getAnimations().map((animation) => ({
        timing: animation.effect?.getTiming(),
        keyframes: animation.effect instanceof KeyframeEffect ? animation.effect.getKeyframes() : [],
      }))
      const start = performance.now()
      const samples: {
        time: number
        height: number
        width: number
        x: number
        opacity: string
        transform: string
        connected: boolean
        related: {
          slot: string | null
          text: string
          x: number
          width: number
          height: number
          opacity: string
          translate: string
          transform: string
          state: string | null
          duration: string
        }[]
      }[] = []
      const sample = () => {
        const time = performance.now() - start
        const rect = element.getBoundingClientRect()
        const style = getComputedStyle(element)
        samples.push({
          time: Math.round(time),
          height: rect.height,
          width: rect.width,
          x: rect.x,
          opacity: style.opacity,
          transform: style.transform,
          connected: element.isConnected,
          related: Array.from(document.querySelectorAll<HTMLElement>(selector)).map((item) => {
            const bounds = item.getBoundingClientRect()
            const computed = getComputedStyle(item)
            return {
              slot: item.dataset.slot ?? null,
              text: item.textContent?.trim().slice(0, 40) ?? "",
              x: bounds.x,
              width: bounds.width,
              height: bounds.height,
              opacity: computed.opacity,
              translate: computed.translate,
              transform: computed.transform,
              state: item.getAttribute("data-state") ?? (item.hasAttribute("data-open") ? "open" : "closed"),
              duration: computed.transitionDuration + "/" + computed.animationDuration,
            }
          }),
        })
        if (time < duration && (element.isConnected || document.querySelector(selector))) {
          pending.current = requestAnimationFrame(sample)
        } else {
          pending.current = 0
          setTrace(JSON.stringify({ animation, animations, samples }))
        }
      }
      pending.current = requestAnimationFrame(sample)
    },
    [selector, duration]
  )
  useEffect(() => {
    const observe = (event: Event) => {
      if (!(event.target instanceof Element)) return
      record(
        event.target,
        event instanceof AnimationEvent ? event.animationName : (event as TransitionEvent).propertyName
      )
    }
    document.addEventListener("animationstart", observe, true)
    document.addEventListener("transitionrun", observe, true)
    return () => {
      document.removeEventListener("animationstart", observe, true)
      document.removeEventListener("transitionrun", observe, true)
    }
  }, [record])
  return { trace }
}
