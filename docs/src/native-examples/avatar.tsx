import { View } from "react-native"
import { Avatar } from "@multicomma/arkcn-react-native/ui/avatar"
export default function AvatarExample() {
  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
      <Avatar.Root accessible accessibilityLabel="Dan Reed">
        <Avatar.Image source={{ uri: "https://github.com/itsdanreed.png" }} />
        <Avatar.Fallback>DR</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Root>
        <Avatar.Fallback>AM</Avatar.Fallback>
      </Avatar.Root>
      <Avatar.Group>
        <Avatar.Root>
          <Avatar.Fallback>DR</Avatar.Fallback>
        </Avatar.Root>
        <Avatar.Root>
          <Avatar.Fallback>AM</Avatar.Fallback>
          <Avatar.Badge />
        </Avatar.Root>
        <Avatar.GroupCount>+3</Avatar.GroupCount>
      </Avatar.Group>
    </View>
  )
}
