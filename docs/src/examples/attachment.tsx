import * as React from "react"
import { toast } from "sonner"
import { DownloadIcon, FileTextIcon, XIcon } from "lucide-react"
import { Attachment } from "@/components/ui/attachment"

export default function AttachmentExample() {
  const [uploading, setUploading] = React.useState(true)
  return (
    <Attachment.Group className="w-80">
      <Attachment.Root>
        <Attachment.Media>
          <FileTextIcon />
        </Attachment.Media>
        <Attachment.Content>
          <Attachment.Title>Quarterly report.pdf</Attachment.Title>
          <Attachment.Description>2.4 MB</Attachment.Description>
        </Attachment.Content>
        <Attachment.Actions>
          <Attachment.ActionTrigger
            aria-label="Download"
            onClick={() => toast("Download selected", { description: "Connect this action to your file URL." })}
          >
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
            <Attachment.ActionTrigger aria-label="Cancel" onClick={() => setUploading(false)}>
              <XIcon />
            </Attachment.ActionTrigger>
          </Attachment.Actions>
        </Attachment.Root>
      )}
    </Attachment.Group>
  )
}
