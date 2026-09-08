import { QrCode } from "@/components/ui/qr-code"

export default function QrCodeExample() {
  return (
    <QrCode.Root value="https://multicomma.com/arkcn" className="size-40">
      <QrCode.Frame>
        <QrCode.Pattern />
      </QrCode.Frame>
    </QrCode.Root>
  )
}
