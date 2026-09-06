import { ChevronsUpDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export default function CollapsibleExample() {
  return (
    <Collapsible className="w-80">
      <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
        <span className="font-medium">3 starred repositories</span>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon-xs" aria-label="Toggle">
            <ChevronsUpDownIcon />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-2 flex flex-col gap-2 text-sm">
        <div className="rounded-md border px-3 py-2">chakra-ui/ark</div>
        <div className="rounded-md border px-3 py-2">tailwindlabs/tailwindcss</div>
      </CollapsibleContent>
    </Collapsible>
  )
}
