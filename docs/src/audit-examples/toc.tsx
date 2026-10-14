import { useState } from "react"
import { LocaleProvider } from "@ark-ui/react"
import { Button } from "@/components/ui/button"
import { Toc } from "@/components/ui/toc"

const items = [
  { value: "installation", label: "Installation", depth: 2 },
  { value: "configuration", label: "Configuration", depth: 3 },
  { value: "advanced", label: "Advanced options", depth: 4 },
  { value: "usage", label: "Usage with a long section heading that wraps", depth: 2 },
]
export default function Example() {
  const [rtl, setRtl] = useState(false)
  const [indicator, setIndicator] = useState(false)
  return (
    <div className="w-full max-w-2xl space-y-4">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" aria-pressed={rtl} onClick={() => setRtl(!rtl)}>
          RTL
        </Button>
        <Button variant="outline" size="sm" aria-pressed={indicator} onClick={() => setIndicator(!indicator)}>
          Indicator
        </Button>
      </div>
      <div dir={rtl ? "rtl" : "ltr"} className="grid grid-cols-2 items-start gap-4">
        <div className="sticky top-4 min-w-0">
          <LocaleProvider locale={rtl ? "ar" : "en"}>
            <Toc.Root asChild items={items} rootMargin="0% 0% -80% 0%" autoScroll={false}>
              <Toc.Nav>
                <Toc.Title>On This Page</Toc.Title>
                <Toc.Content>
                  <Toc.List>
                    {items.map((item) => (
                      <Toc.Item key={item.value} item={item}>
                        <Toc.Link href={`#${item.value}`}>{item.label}</Toc.Link>
                      </Toc.Item>
                    ))}
                  </Toc.List>
                  {indicator && <Toc.Indicator />}
                </Toc.Content>
              </Toc.Nav>
            </Toc.Root>
          </LocaleProvider>
        </div>
        <article className="pb-[100svh]">
          {items.map((item) => (
            <section key={item.value} className="min-h-80">
              <h2 id={item.value} className="text-sm font-medium">
                {item.label}
              </h2>
            </section>
          ))}
        </article>
      </div>
    </div>
  )
}
