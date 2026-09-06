import * as React from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/** Truncates its text and reveals the full value in a tooltip when it overflows. */
export function LongText({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [overflows, setOverflows] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => setOverflows(el.scrollWidth > el.clientWidth)
    check()
    const observer = new ResizeObserver(check)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (!overflows) {
    return (
      <div ref={ref} className={cn("truncate", className)}>
        {children}
      </div>
    )
  }
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div ref={ref} className={cn("truncate", className)}>
          {children}
        </div>
      </TooltipTrigger>
      <TooltipContent>{children}</TooltipContent>
    </Tooltip>
  )
}
