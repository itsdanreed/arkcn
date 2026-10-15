import { View } from "react-native"
import { MapPinIcon } from "lucide-react-native"
import { Marker } from "@multicomma/arkcn-react-native/ui/marker"

export default function MarkerExample() {
  return (
    <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 24 }}>
      <Marker.Root style={{ width: "auto" }}>
        <Marker.Icon>
          <MapPinIcon />
        </Marker.Icon>
        <Marker.Content>Office</Marker.Content>
      </Marker.Root>
      <Marker.Root variant="border" style={{ width: "auto" }}>
        <Marker.Icon>
          <MapPinIcon />
        </Marker.Icon>
        <Marker.Content>Warehouse</Marker.Content>
      </Marker.Root>
    </View>
  )
}
