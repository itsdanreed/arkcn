import { QrCode, QrCodeFrame, QrCodePattern } from "@/components/ui/qr-code"

export default function QrCodeExample() {
  return (
    <QrCode value="https://multicomma.com/arkcn" className="size-40">
      <QrCodeFrame>
        <QrCodePattern />
      </QrCodeFrame>
    </QrCode>
  )
}
