import { UploadIcon } from "lucide-react"
import { FileUpload } from "@/components/ui/file-upload"

export default function FileUploadExample() {
  return (
    <FileUpload.Root maxFiles={3} className="w-80">
      <FileUpload.Label>Attachments</FileUpload.Label>
      <FileUpload.Dropzone>
        <UploadIcon className="text-muted-foreground" />
        <span className="text-sm">Drag files here or click to browse</span>
      </FileUpload.Dropzone>
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
  )
}
