import { FileUpload } from "@/components/ui/file-upload"
const files = [
  new File(["x".repeat(1024)], "notes.txt", { type: "text/plain" }),
  new File(["x".repeat(2048)], "a-very-long-project-document-name-that-must-truncate.txt", { type: "text/plain" }),
]
export default function Example() {
  return (
    <div className="w-80 max-w-full space-y-6">
      {["default", "disabled", "invalid", "readonly"].map((state) => (
        <section key={state} data-audit-case={state}>
          <FileUpload.Root
            defaultAcceptedFiles={files}
            disabled={state === "disabled"}
            invalid={state === "invalid"}
            readOnly={state === "readonly"}
            maxFiles={3}
          >
            <FileUpload.Label>{state} attachments</FileUpload.Label>
            <FileUpload.Dropzone />
            <div className="flex gap-2">
              <FileUpload.Trigger>Browse</FileUpload.Trigger>
              <FileUpload.ClearTrigger>Clear all</FileUpload.ClearTrigger>
            </div>
            <FileUpload.ItemGroup>
              <FileUpload.Context>
                {(api) =>
                  api.acceptedFiles.map((file) => (
                    <FileUpload.Item key={file.name} file={file}>
                      <FileUpload.ItemPreview />
                      <FileUpload.ItemName />
                      <FileUpload.ItemSizeText />
                      <FileUpload.ItemDeleteTrigger />
                    </FileUpload.Item>
                  ))
                }
              </FileUpload.Context>
            </FileUpload.ItemGroup>
            <FileUpload.HiddenInput />
          </FileUpload.Root>
        </section>
      ))}
    </div>
  )
}
