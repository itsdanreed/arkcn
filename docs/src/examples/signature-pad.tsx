import { SignaturePad } from "@/components/ui/signature-pad"

export default function SignaturePadExample() {
  return (
    <SignaturePad.Root className="w-80">
      <SignaturePad.Label>Sign here</SignaturePad.Label>
      <SignaturePad.Control />
    </SignaturePad.Root>
  )
}
