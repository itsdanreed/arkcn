import { useState } from "react"
import { Text, View } from "react-native"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { useNativeTheme } from "@/lib/theme"

export function ScrollAreaValidation() {
  const { colors, typography } = useNativeTheme()
  const [wide, setWide] = useState(true)
  const [tall, setTall] = useState(true)
  const [count, setCount] = useState(8)
  const [disabled, setDisabled] = useState(false)
  const [pressed, setPressed] = useState(0)
  const text = { ...typography.regular, fontSize: 14, lineHeight: 20, color: colors.foreground }
  return (
    <View style={{ gap: 12 }}>
      <Text style={text}>Two axes · independent scrolling · shared corner</Text>
      <ScrollArea.Root
        orientation="both"
        disabled={disabled}
        composed
        style={{
          width: 320,
          maxWidth: "100%",
          height: 180,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
        }}
      >
        <ScrollArea.Viewport>
          <ScrollArea.Content style={{ width: wide ? 640 : 260 }}>
            {Array.from({ length: tall ? 12 : 2 }, (_, row) => (
              <View key={row} style={{ flexDirection: "row", borderBottomWidth: 1, borderColor: colors.border }}>
                {Array.from({ length: 4 }, (_, col) => (
                  <View
                    key={col}
                    style={{
                      width: wide ? 160 : 65,
                      height: 40,
                      paddingHorizontal: 12,
                      justifyContent: "center",
                      borderEndWidth: 1,
                      borderColor: colors.border,
                    }}
                  >
                    <Text style={text}>
                      {row + 1} · {col + 1}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" />
        <ScrollArea.Scrollbar orientation="horizontal" />
        <ScrollArea.Corner testID="two-axis-corner" />
        <ScrollArea.Context>
          {(api) => (
            <Button
              size="xs"
              style={{ position: "absolute", top: 6, right: 16 }}
              onPress={() =>
                api.scrollTo(
                  api.position.x || api.position.y
                    ? { x: 0, y: 0 }
                    : { x: api.axes.horizontal.maxOffset, y: api.axes.vertical.maxOffset }
                )
              }
            >
              {api.position.x || api.position.y ? "Start" : "End"}
            </Button>
          )}
        </ScrollArea.Context>
      </ScrollArea.Root>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Button variant="outline" onPress={() => setWide(!wide)}>
          {wide ? "Fit width" : "Overflow width"}
        </Button>
        <Button variant="outline" onPress={() => setTall(!tall)}>
          {tall ? "Fit height" : "Overflow height"}
        </Button>
      </View>
      <Text style={text}>Horizontal · dynamic content · nested actions</Text>
      <ScrollArea.Root
        orientation="horizontal"
        disabled={disabled}
        style={{ height: 112, width: "100%", borderWidth: 1, borderColor: colors.border, borderRadius: 8 }}
      >
        <View style={{ flexDirection: "row", gap: 12, padding: 12 }}>
          {Array.from({ length: count }, (_, i) => (
            <Button key={i} variant="outline" style={{ width: 160, height: 72 }} onPress={() => setPressed(i + 1)}>
              Item {i + 1}
            </Button>
          ))}
        </View>
      </ScrollArea.Root>
      <Text style={text}>Last pressed: {pressed || "none"}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Button variant="outline" onPress={() => setCount(count === 8 ? 1 : 8)}>
          {count === 8 ? "Shrink content" : "Restore content"}
        </Button>
        <Button variant="outline" onPress={() => setDisabled(!disabled)}>
          {disabled ? "Enable scrolling" : "Disable scrolling"}
        </Button>
      </View>
      <ScrollArea.Root
        composed
        style={{ height: 140, width: 240, borderWidth: 1, borderColor: colors.border, borderRadius: 8 }}
      >
        <ScrollArea.Viewport>
          <ScrollArea.Content style={{ padding: 12, gap: 8 }}>
            {Array.from({ length: 12 }, (_, i) => (
              <Text key={i} style={text}>
                Composed row {i + 1}
              </Text>
            ))}
          </ScrollArea.Content>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar />
        <ScrollArea.Context>
          {(api) => (
            <Button
              size="xs"
              style={{ position: "absolute", bottom: 8, right: 16 }}
              onPress={() => api.scrollTo(api.offset > 0 ? 0 : api.maxOffset)}
            >
              {api.offset > 0 ? "Top" : "Bottom"}
            </Button>
          )}
        </ScrollArea.Context>
      </ScrollArea.Root>
    </View>
  )
}
