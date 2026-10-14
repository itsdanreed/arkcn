import { Button } from "@/components/ui/button"
import { QrCode } from "@/components/ui/qr-code"

export default function Example() {
  return (
    <QrCode.Root value="https://multicomma.com/arkcn" className="flex flex-col items-start gap-4">
      <div className="flex flex-wrap gap-4">
        <QrCode.DownloadTrigger fileName="arkcn-audit.svg" mimeType="image/svg+xml" data-audit-case="default">
          Download SVG
        </QrCode.DownloadTrigger>
        <QrCode.DownloadTrigger
          fileName="arkcn-disabled.svg"
          mimeType="image/svg+xml"
          disabled
          data-audit-case="disabled"
        >
          Download disabled
        </QrCode.DownloadTrigger>
        <QrCode.DownloadTrigger fileName="arkcn-custom.svg" mimeType="image/svg+xml" asChild>
          <Button variant="secondary" size="sm" data-audit-case="custom">
            Custom download
          </Button>
        </QrCode.DownloadTrigger>
      </div>
      <QrCode.Frame>
        <QrCode.Pattern />
      </QrCode.Frame>
    </QrCode.Root>
  )
}
