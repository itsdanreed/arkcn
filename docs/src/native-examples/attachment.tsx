import { useState } from "react"
import { Text, View } from "react-native"
import { DownloadIcon, FileTextIcon, XIcon } from "lucide-react-native"
import { Attachment } from "@multicomma/arkcn-react-native/ui/attachment"
import { useNativeTheme } from "@multicomma/arkcn-react-native/lib/theme"

export default function AttachmentExample() {
  const [uploading, setUploading] = useState(true)
  const [selected, setSelected] = useState(false)
  const { colors, typography } = useNativeTheme()
  return (
    <View style={{ width: 320, maxWidth: "100%", gap: 8 }}>
      <Attachment.Group>
        <Attachment.Root>
          <Attachment.Media>
            <FileTextIcon />
          </Attachment.Media>
          <Attachment.Content>
            <Attachment.Title>Quarterly report.pdf</Attachment.Title>
            <Attachment.Description>2.4 MB</Attachment.Description>
          </Attachment.Content>
          <Attachment.Actions>
            <Attachment.ActionTrigger accessibilityLabel="Download" onPress={() => setSelected(true)}>
              <DownloadIcon />
            </Attachment.ActionTrigger>
          </Attachment.Actions>
        </Attachment.Root>
        {uploading && (
          <Attachment.Root state="uploading">
            <Attachment.Media>
              <FileTextIcon />
            </Attachment.Media>
            <Attachment.Content>
              <Attachment.Title>Roadmap.key</Attachment.Title>
              <Attachment.Description>Uploading…</Attachment.Description>
            </Attachment.Content>
            <Attachment.Actions>
              <Attachment.ActionTrigger accessibilityLabel="Cancel" onPress={() => setUploading(false)}>
                <XIcon />
              </Attachment.ActionTrigger>
            </Attachment.Actions>
          </Attachment.Root>
        )}
      </Attachment.Group>
      {selected && (
        <Text
          accessibilityLiveRegion="polite"
          style={{ ...typography.regular, fontSize: 12, lineHeight: 16, color: colors.mutedForeground }}
        >
          Download selected. Connect this action to your file URL.
        </Text>
      )}
    </View>
  )
}
