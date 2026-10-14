import { useState } from "react"
import { FileIcon, UploadIcon, XIcon } from "lucide-react"
import { Label } from "../ui/label"
import { Button } from "../ui/button"
import { EmptyHeader, EmptyMedia, EmptyDescription } from "../ui/empty"
import {
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
} from "../ui/attachment"
const files = [
  { name: "notes.txt", size: "1.02 kB" },
  { name: "a-very-long-project-document-name-that-must-truncate.txt", size: "2.05 kB" },
]
function Case({ state }: { state: string }) {
  const [accepted, setAccepted] = useState(files)
  const disabled = state === "disabled" || state === "readonly"
  return (
    <section data-audit-case={state} className="flex flex-col gap-3">
      <Label>{state} attachments</Label>
      <Button
        variant="outline"
        disabled={disabled}
        aria-invalid={state === "invalid" || undefined}
        className="h-auto min-h-32 w-full flex-col gap-4 rounded-xl border-dashed p-6 text-center text-balance whitespace-normal"
      >
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <UploadIcon />
          </EmptyMedia>
          <EmptyDescription>Drag your files here or click to browse</EmptyDescription>
        </EmptyHeader>
      </Button>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={disabled}>
          Browse
        </Button>
        {accepted.length > 0 && (
          <Button variant="ghost" size="sm" disabled={disabled} onClick={() => setAccepted([])}>
            Clear all
          </Button>
        )}
      </div>
      <div className="flex flex-col gap-2">
        {accepted.map((file) => (
          <Attachment key={file.name} className="w-full">
            <AttachmentMedia>
              <FileIcon />
            </AttachmentMedia>
            <AttachmentContent>
              <AttachmentTitle>{file.name}</AttachmentTitle>
              <AttachmentDescription>{file.size}</AttachmentDescription>
            </AttachmentContent>
            <AttachmentActions>
              <AttachmentAction
                disabled={disabled}
                aria-label={`Delete file ${file.name}`}
                onClick={() => setAccepted((current) => current.filter((item) => item !== file))}
              >
                <XIcon />
              </AttachmentAction>
            </AttachmentActions>
          </Attachment>
        ))}
      </div>
    </section>
  )
}
export default function Example() {
  return (
    <div className="w-80 max-w-full space-y-6">
      {["default", "disabled", "invalid", "readonly"].map((state) => (
        <Case key={state} state={state} />
      ))}
    </div>
  )
}
