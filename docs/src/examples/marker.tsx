import { MapPinIcon } from "lucide-react"
import { Marker } from "@/components/ui/marker"

export default function MarkerExample() {
  return (
    <div className="flex items-end gap-6">
      <Marker.Root>
        <Marker.Icon>
          <MapPinIcon />
        </Marker.Icon>
        <Marker.Content>Office</Marker.Content>
      </Marker.Root>
      <Marker.Root variant="border">
        <Marker.Icon>
          <MapPinIcon />
        </Marker.Icon>
        <Marker.Content>Warehouse</Marker.Content>
      </Marker.Root>
    </div>
  )
}
