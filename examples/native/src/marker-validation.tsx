import { useState } from "react"
import { MapPinIcon, CalendarIcon } from "lucide-react-native"
import { Text, View } from "react-native"
import { Marker } from "@/components/ui/marker"
import { Button } from "@/components/ui/button"
import { useNativeTheme } from "@/lib/theme"

export function MarkerValidation() {
  const { colors, typography } = useNativeTheme()
  const [narrow, setNarrow] = useState(false)
  const [rtl, setRtl] = useState(false)
  const [visits, setVisits] = useState(0)
  return (
    <View style={{ gap: 24, width: 560, maxWidth: "100%" }}>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <Button variant="outline" onPress={() => setNarrow(!narrow)}>
          {narrow ? "Wide markers" : "Narrow markers"}
        </Button>
        <Button variant="outline" onPress={() => setRtl(!rtl)}>
          {rtl ? "Left to right" : "Right to left"}
        </Button>
      </View>
      <View style={{ gap: 24, width: narrow ? 220 : "100%", direction: rtl ? "rtl" : "ltr" }}>
        <Marker.Root variant="separator">
          <Marker.Content>Today</Marker.Content>
        </Marker.Root>
        <Marker.Root variant="separator">
          <Marker.Icon>
            <CalendarIcon />
          </Marker.Icon>
          <Marker.Content>Wednesday, October 14</Marker.Content>
        </Marker.Root>
        <Marker.Root variant="border">
          <Marker.Icon>
            <MapPinIcon />
          </Marker.Icon>
          <Marker.Content>Warehouse — deliveries enter through the courtyard behind the building</Marker.Content>
        </Marker.Root>
        <Marker.Root
          accessibilityRole="link"
          accessibilityLabel="Open office details"
          onPress={() => setVisits(visits + 1)}
        >
          <Marker.Icon>
            <MapPinIcon />
          </Marker.Icon>
          <Marker.Content>Open office details</Marker.Content>
        </Marker.Root>
        <Marker.Root
          accessibilityRole="link"
          accessibilityLabel="Unavailable location"
          disabled
          onPress={() => setVisits(visits + 1)}
        >
          <Marker.Icon>
            <MapPinIcon />
          </Marker.Icon>
          <Marker.Content>Unavailable location</Marker.Content>
        </Marker.Root>
      </View>
      <Text style={{ ...typography.regular, fontSize: 14, lineHeight: 20, color: colors.mutedForeground }}>
        Office opened: {visits}
      </Text>
    </View>
  )
}
