import { useState } from "react"
import { Image, Text, View } from "react-native"
import { FileTextIcon, RotateCcwIcon, XIcon } from "lucide-react-native"
import { Attachment, type AttachmentRootProps } from "@/components/ui/attachment"
import { Button } from "@/components/ui/button"
import { useNativeTheme } from "@/lib/theme"

// Embedded preview keeps the fixture independent of networking and image permissions.
const preview = require("../assets/icon.png")
export function AttachmentValidation() {
  const { colors, typography } = useNativeTheme()
  const [state, setState] = useState<AttachmentRootProps["state"]>("uploading")
  const [opened, setOpened] = useState(0)
  const [retry, setRetry] = useState(0)
  const [narrow, setNarrow] = useState(false)
  const [removed, setRemoved] = useState(false)
  return (
    <View style={{ gap: 20, width: 640, maxWidth: "100%" }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {(["idle", "uploading", "processing", "error", "done"] as const).map((value) => (
          <Button
            key={value}
            size="sm"
            variant={value === state ? "default" : "outline"}
            onPress={() => setState(value)}
          >
            {value}
          </Button>
        ))}
        <Button size="sm" variant="outline" onPress={() => setNarrow(!narrow)}>
          {narrow ? "Wide attachments" : "Narrow attachments"}
        </Button>
      </View>
      <View style={{ width: narrow ? 220 : 360, maxWidth: "100%", gap: 16 }}>
        {(["default", "sm", "xs"] as const).map((size) => (
          <Attachment.Root key={size} size={size} state={state} style={{ width: "100%" }}>
            <Attachment.Media>
              <FileTextIcon />
            </Attachment.Media>
            <Attachment.Content>
              <Attachment.Title>{size} — Quarterly planning report.pdf</Attachment.Title>
              <Attachment.Description>
                {state === "error" ? "Upload failed" : state === "done" ? "2.4 MB" : `${state}…`}
              </Attachment.Description>
            </Attachment.Content>
            <Attachment.Trigger accessibilityLabel={`Open ${size} attachment`} onPress={() => setOpened(opened + 1)} />
            <Attachment.Actions>
              <Attachment.ActionTrigger
                accessibilityLabel={`Retry ${size} attachment`}
                onPress={() => {
                  setRetry(retry + 1)
                  setState("uploading")
                }}
              >
                <RotateCcwIcon />
              </Attachment.ActionTrigger>
            </Attachment.Actions>
          </Attachment.Root>
        ))}
        <Attachment.Root>
          <Attachment.Content>
            <Attachment.Title>Unavailable file.pdf</Attachment.Title>
            <Attachment.Description>Not available offline</Attachment.Description>
          </Attachment.Content>
          <Attachment.Trigger
            disabled
            accessibilityLabel="Unavailable attachment"
            onPress={() => setOpened(opened + 1)}
          />
        </Attachment.Root>
      </View>
      <View style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}>
        {!removed && (
          <Attachment.Root orientation="vertical" state={state}>
            <Attachment.Media variant="image">
              <Image source={preview} accessibilityLabel="App icon preview" />
            </Attachment.Media>
            <Attachment.Content>
              <Attachment.Title>Preview.png</Attachment.Title>
              <Attachment.Description>12 KB</Attachment.Description>
            </Attachment.Content>
            <Attachment.Trigger accessibilityLabel="Open image attachment" onPress={() => setOpened(opened + 1)} />
            <Attachment.Actions>
              <Attachment.ActionTrigger accessibilityLabel="Remove image attachment" onPress={() => setRemoved(true)}>
                <XIcon />
              </Attachment.ActionTrigger>
            </Attachment.Actions>
          </Attachment.Root>
        )}
        <Attachment.Root orientation="vertical" size="sm" state="error">
          <Attachment.Media>
            <FileTextIcon />
          </Attachment.Media>
          <Attachment.Content>
            <Attachment.Title>Report.pdf</Attachment.Title>
            <Attachment.Description>Upload failed</Attachment.Description>
          </Attachment.Content>
        </Attachment.Root>
      </View>
      {removed && (
        <Button variant="outline" onPress={() => setRemoved(false)}>
          Restore image
        </Button>
      )}
      <Text style={{ ...typography.regular, color: colors.mutedForeground, fontSize: 14, lineHeight: 20 }}>
        Opened: {opened} · Retries: {retry}
      </Text>
    </View>
  )
}
