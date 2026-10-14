import { FileTextIcon, XIcon } from "lucide-react"
import { Attachment } from "../adapters/attachment"
import { Spinner } from "../adapters/spinner"
import { useAuditMotion } from "../../src/audit-motion"
const image =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Cpath fill='%23888' d='M0 0h64v64H0z'/%3E%3Cpath fill='%23ccc' d='M8 48 24 24l12 12 8-8 12 20z'/%3E%3C/svg%3E"
export default function Example() {
  const { trace } = useAuditMotion('[data-slot="attachment-title"]', 2100)
  return (
    <div className="space-y-5">
      {(["default", "sm", "xs"] as const).map((size) => (
        <section key={size} data-audit-case={size}>
          <Attachment.Group>
            {(["done", "idle", "uploading", "processing", "error"] as const).map((state) => (
              <Attachment.Root key={state} size={size} state={state}>
                <Attachment.Media>{state === "uploading" ? <Spinner.Root /> : <FileTextIcon />}</Attachment.Media>
                <Attachment.Content>
                  <Attachment.Title>{state}.pdf</Attachment.Title>
                  <Attachment.Description>{state === "error" ? "Upload failed" : "2.4 MB"}</Attachment.Description>
                </Attachment.Content>
                <Attachment.Trigger aria-label={`${size} ${state} attachment`} />
                <Attachment.Actions>
                  <Attachment.ActionTrigger aria-label={`Remove ${size} ${state}`}>
                    <XIcon />
                  </Attachment.ActionTrigger>
                </Attachment.Actions>
              </Attachment.Root>
            ))}
          </Attachment.Group>
        </section>
      ))}
      <section data-audit-case="vertical">
        <Attachment.Group>
          {(["done", "uploading", "error"] as const).map((state) => (
            <Attachment.Root key={state} state={state} orientation="vertical">
              <Attachment.Media variant="image">
                <img src={image} alt="Sample preview" />
              </Attachment.Media>
              <Attachment.Content>
                <Attachment.Title>Landscape.png</Attachment.Title>
                <Attachment.Description>{state}</Attachment.Description>
              </Attachment.Content>
              <Attachment.Actions>
                <Attachment.ActionTrigger aria-label={`Remove image ${state}`}>
                  <XIcon />
                </Attachment.ActionTrigger>
              </Attachment.Actions>
            </Attachment.Root>
          ))}
        </Attachment.Group>
      </section>
      <output hidden data-motion-trace>
        {trace}
      </output>
    </div>
  )
}
