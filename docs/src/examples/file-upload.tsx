import { UploadIcon } from "lucide-react"
import {
  FileUpload,
  FileUploadContext,
  FileUploadDropzone,
  FileUploadHiddenInput,
  FileUploadItem,
  FileUploadItemDeleteTrigger,
  FileUploadItemGroup,
  FileUploadItemName,
  FileUploadItemPreview,
  FileUploadItemSizeText,
  FileUploadLabel,
} from "@/components/ui/file-upload"

export default function FileUploadExample() {
  return (
    <FileUpload maxFiles={3} className="w-80">
      <FileUploadLabel>Attachments</FileUploadLabel>
      <FileUploadDropzone>
        <UploadIcon className="text-muted-foreground" />
        <span className="text-sm">Drag files here or click to browse</span>
      </FileUploadDropzone>
      <FileUploadItemGroup>
        <FileUploadContext>
          {(api) =>
            api.acceptedFiles.map((file) => (
              <FileUploadItem key={file.name} file={file}>
                <FileUploadItemPreview />
                <FileUploadItemName />
                <FileUploadItemSizeText />
                <FileUploadItemDeleteTrigger />
              </FileUploadItem>
            ))
          }
        </FileUploadContext>
      </FileUploadItemGroup>
      <FileUploadHiddenInput />
    </FileUpload>
  )
}
