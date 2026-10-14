import { LocaleProvider } from "@ark-ui/react"
import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Marquee } from "@/components/ui/marquee"

export default function Example() {
  const [paused, setPaused] = useState(false)
  const [reverse, setReverse] = useState(false)
  const [vertical, setVertical] = useState(false)
  const [rtl, setRtl] = useState(false)
  return (
    <div className="w-full max-w-sm space-y-4" dir={rtl ? "rtl" : "ltr"}>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" aria-pressed={paused} onClick={() => setPaused(!paused)}>
          {paused ? "Resume" : "Pause"}
        </Button>
        <Button variant="outline" size="sm" aria-pressed={reverse} onClick={() => setReverse(!reverse)}>
          Reverse
        </Button>
        <Button variant="outline" size="sm" aria-pressed={vertical} onClick={() => setVertical(!vertical)}>
          Vertical
        </Button>
        <Button variant="outline" size="sm" aria-pressed={rtl} onClick={() => setRtl(!rtl)}>
          RTL
        </Button>
      </div>
      <LocaleProvider locale={rtl ? "ar" : "en"}>
        <Marquee.Root
          paused={paused}
          reverse={reverse}
          side={vertical ? "top" : "start"}
          autoFill
          speed={40}
          className={vertical ? "h-36" : undefined}
        >
          <Marquee.Viewport>
            <Marquee.Content>
              {["Acme", "Globex", "Initech"].map((name) => (
                <Marquee.Item key={name}>
                  <Badge.Root variant="secondary">{name}</Badge.Root>
                </Marquee.Item>
              ))}
            </Marquee.Content>
          </Marquee.Viewport>
          <Marquee.Edge side={vertical ? "top" : "start"} />
          <Marquee.Edge side={vertical ? "bottom" : "end"} />
        </Marquee.Root>
      </LocaleProvider>
    </div>
  )
}
