import { SignaturePad, SignaturePadControl, SignaturePadLabel } from "@/components/ui/signature-pad"

export default function SignaturePadExample() {
  return (
    <SignaturePad className="w-80">
      <SignaturePadLabel>Sign here</SignaturePadLabel>
      <SignaturePadControl />
    </SignaturePad>
  )
}
