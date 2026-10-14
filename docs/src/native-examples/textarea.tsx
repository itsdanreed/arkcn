import { useState } from "react"
import { Textarea } from "@multicomma/arkcn-react-native/ui/textarea"

export default function TextareaExample() {
  const [value, setValue] = useState("")
  return (
    <Textarea.Root
      accessibilityLabel="Message"
      placeholder="Type your message here."
      value={value}
      onChangeText={setValue}
      style={{ width: "100%", maxWidth: 320 }}
    />
  )
}
