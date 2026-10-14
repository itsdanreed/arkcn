import { Text, View } from "react-native"
import { AspectRatio } from "@multicomma/arkcn-react-native/ui/aspect-ratio"
import { useNativeTheme } from "@multicomma/arkcn-react-native/lib/theme"
export default function AspectRatioExample() {
  const { colors, radius, typography, fontSize, lineHeight } = useNativeTheme()
  return (
    <View style={{ width: 384, maxWidth: "100%" }}>
      <AspectRatio.Root
        ratio={16 / 9}
        style={{
          borderRadius: radius.lg,
          backgroundColor: colors.muted,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text
          style={{
            ...typography.regular,
            fontSize: fontSize.md,
            lineHeight: lineHeight.md,
            color: colors.mutedForeground,
          }}
        >
          16 : 9
        </Text>
      </AspectRatio.Root>
    </View>
  )
}
