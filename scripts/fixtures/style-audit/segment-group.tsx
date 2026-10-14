import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs"
export default function Example() {
  const [long, setLong] = useState(false)

  return (
    <div className="space-y-5">
      {["horizontal", "vertical", "rtl", "scaled"].map((state) => (
        <section key={state} data-audit-case={state} dir={state === "rtl" ? "rtl" : "ltr"}>
          <p className="mb-2 text-sm">{state}</p>
          <Tabs
            className={state === "scaled" ? "origin-top-left scale-110" : undefined}
            defaultValue="First"
            orientation={state === "vertical" ? "vertical" : "horizontal"}
          >
            <TabsList aria-label={state}>
              {["First", "Second", "Disabled"].map((name) => (
                <TabsTrigger key={name} value={name} disabled={name === "Disabled"}>
                  {name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </section>
      ))}
      <section data-audit-case="provider">
        <p className="mb-2 text-sm">provider + resizing</p>
        <div className="flex items-center">
          <Tabs defaultValue="Second">
            <TabsList>
              <TabsTrigger value="First">{long ? "A much longer first choice" : "First"}</TabsTrigger>
              <TabsTrigger value="Second">Second</TabsTrigger>
            </TabsList>
          </Tabs>
          <button className="ml-3 text-sm underline" onClick={() => setLong(!long)}>
            Resize label
          </button>
        </div>
      </section>
    </div>
  )
}
