import { MapPinIcon } from "lucide-react"
import { Marker, MarkerContent, MarkerIcon } from "@/components/ui/marker"

export default function MarkerExample() {
  return (
    <div className="flex items-end gap-6">
      <Marker>
        <MarkerIcon>
          <MapPinIcon />
        </MarkerIcon>
        <MarkerContent>Office</MarkerContent>
      </Marker>
      <Marker variant="border">
        <MarkerIcon>
          <MapPinIcon />
        </MarkerIcon>
        <MarkerContent>Warehouse</MarkerContent>
      </Marker>
    </div>
  )
}
