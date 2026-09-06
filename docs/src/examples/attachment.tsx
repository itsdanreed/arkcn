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
          <AttachmentActionTrigger aria-label="Download">
            <DownloadIcon />
          </AttachmentActionTrigger>
        </AttachmentActions>
      </Attachment>
      <Attachment state="uploading">
        <AttachmentMedia>
          <FileTextIcon />
        </AttachmentMedia>
        <AttachmentContent>
          <AttachmentTitle>Roadmap.key</AttachmentTitle>
          <AttachmentDescription>Uploading…</AttachmentDescription>
        </AttachmentContent>
        <AttachmentActions>
          <AttachmentActionTrigger aria-label="Cancel">
            <XIcon />
          </AttachmentActionTrigger>
        </AttachmentActions>
      </Attachment>
    </AttachmentGroup>
  )
}
