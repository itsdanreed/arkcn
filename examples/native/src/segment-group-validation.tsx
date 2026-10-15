import { useState } from "react"
import { Text, View } from "react-native"
import { Button } from "@/components/ui/button"
import { SegmentGroup } from "@/components/ui/segment-group"
import { useNativeTheme } from "@/lib/theme"

/** Device checks beyond the shared documentation example. */
export function SegmentGroupValidation() {
  const { colors, typography } = useNativeTheme()
  const [value, setValue] = useState<string | null>("week")
  const [expanded, setExpanded] = useState(false)
  const labelStyle = { ...typography.regular, color: colors.mutedForeground, fontSize: 14, lineHeight: 20 }
  return (
    <View style={{ gap: 16 }}>
      <Text style={labelStyle}>Controlled vertical group · selected: {value ?? "none"}</Text>
      <SegmentGroup.Root
        value={value}
        onValueChange={({ value }) => setValue(value)}
        orientation="vertical"
        accessibilityLabel="Vertical calendar view"
      >
        <SegmentGroup.Indicator />
        <SegmentGroup.Item value="day">{expanded ? "Day with a longer label" : "Day"}</SegmentGroup.Item>
        <SegmentGroup.Item value="week">Week</SegmentGroup.Item>
        <SegmentGroup.Item value="month" disabled>
          Month (disabled)
        </SegmentGroup.Item>
      </SegmentGroup.Root>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
        <Button variant="outline" onPress={() => setExpanded(!expanded)}>
          Change label width
        </Button>
        <Button variant="outline" onPress={() => setValue(null)}>
          Clear selection
        </Button>
        <Button variant="outline" onPress={() => setValue("week")}>
          Select Week
        </Button>
      </View>
      <Text style={labelStyle}>Right to left</Text>
      <SegmentGroup.Root defaultValue="week" dir="rtl" accessibilityLabel="Right to left calendar view">
        <SegmentGroup.Indicator />
        <SegmentGroup.Item value="day">Day</SegmentGroup.Item>
        <SegmentGroup.Item value="week">Week</SegmentGroup.Item>
        <SegmentGroup.Item value="month">Month</SegmentGroup.Item>
      </SegmentGroup.Root>
      <Text style={labelStyle}>Read only</Text>
      <SegmentGroup.Root defaultValue="week" readOnly accessibilityLabel="Read only calendar view">
        <SegmentGroup.Indicator />
        <SegmentGroup.Item value="day">Day</SegmentGroup.Item>
        <SegmentGroup.Item value="week">Week</SegmentGroup.Item>
        <SegmentGroup.Item value="month">Month</SegmentGroup.Item>
      </SegmentGroup.Root>
    </View>
  )
}
