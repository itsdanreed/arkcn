import * as React from "react"
import { toast } from "sonner"
import { DownloadIcon, FileTextIcon, XIcon } from "lucide-react"
import {
  Attachment,
  AttachmentActionTrigger,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"

export default function AttachmentExample() {
  const [uploading, setUploading] = React.useState(true)
  return (
    <AttachmentGroup className="w-80">
      <Attachment>
        <AttachmentMedia>
          <FileTextIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>Quarterly report.pdf</AttachmentTitle>
          <AttachmentDescription>2.4 MB</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentActionTrigger
            aria-label="Download"
            onClick={() => toast("Download selected", { description: "Connect this action to your file URL." })}
          >
            <DownloadIcon />
          </AttachmentActionTrigger>
        </AttachmentActions>
      </Attachment>
      {uploading && (
        <Attachment state="uploading">
          <AttachmentMedia>
            <FileTextIcon />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>Roadmap.key</AttachmentTitle>
            <AttachmentDescription>Uploading…</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentActionTrigger aria-label="Cancel" onClick={() => setUploading(false)}>
              <XIcon />
            </AttachmentActionTrigger>
          </AttachmentActions>
        </Attachment>
      )}
    </AttachmentGroup>
  )
}
