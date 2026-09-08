import { ScrollArea } from "@/components/ui/scroll-area"

const tags = Array.from({ length: 30 }, (_, i) => `v1.${i}.0`)

export default function ScrollAreaExample() {
  return (
    <ScrollArea.Root className="h-56 w-48 rounded-md border">
      <div className="p-3">
        <h4 className="mb-2 text-sm font-medium">Tags</h4>
        {tags.map((tag) => (
          <div key={tag} className="border-b py-1.5 text-sm last:border-0">
            {tag}
          </div>
        ))}
      </div>
    </ScrollArea.Root>
  )
}
