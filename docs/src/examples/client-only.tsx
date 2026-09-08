import { ClientOnly } from "@/components/ui/client-only"
export default function ClientOnlyExample() {
  return (
    <ClientOnly.Root fallback={<p>Loading client content…</p>}>
      {() => <p className="text-sm">This content renders after the browser mounts.</p>}
    </ClientOnly.Root>
  )
}
