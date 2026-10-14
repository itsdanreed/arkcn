import { View } from "react-native"
import { Skeleton } from "@multicomma/arkcn-react-native/ui/skeleton"
export default function SkeletonExample() {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 16, maxWidth: "100%" }}>
      <Skeleton.Root style={{ width: 48, height: 48, borderRadius: 9999 }} />
      <View style={{ gap: 8, flexShrink: 1 }}>
        <Skeleton.Root style={{ width: 192, maxWidth: "100%", height: 16 }} />
        <Skeleton.Root style={{ width: 128, maxWidth: "100%", height: 16 }} />
      </View>
    </View>
  )
}
