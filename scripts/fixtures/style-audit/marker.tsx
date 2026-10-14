import { MapPinIcon } from "lucide-react"
import { Marker } from "../adapters/marker"
export default function Example() {
  return (
    <div className="space-y-6">
      {(["default", "separator", "border"] as const).map((variant) => (
        <section key={variant} data-audit-case={variant} className="space-y-4">
          <Marker.Root variant={variant}>
            <Marker.Icon>
              <MapPinIcon />
            </Marker.Icon>
            <Marker.Content>Office location</Marker.Content>
          </Marker.Root>
          <Marker.Root variant={variant} asChild>
            <a href="#office">
              <Marker.Content>Open {variant} location</Marker.Content>
            </a>
          </Marker.Root>
          <Marker.Root variant={variant}>
            <Marker.Content>
              A long marker containing a <a href="#details">details link</a> and wrapping content.
            </Marker.Content>
          </Marker.Root>
        </section>
      ))}
    </div>
  )
}
