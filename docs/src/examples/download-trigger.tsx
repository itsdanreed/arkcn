import { DownloadTrigger } from "@/components/ui/download-trigger"
export default function DownloadTriggerExample() {
  return (
    <DownloadTrigger.Root data="Hello from arkcn!" fileName="arkcn-example.txt" mimeType="text/plain">
      Download example
    </DownloadTrigger.Root>
  )
}
