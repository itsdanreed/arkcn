import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

export default function PopoverExample() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Dimensions</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>Dimensions</PopoverTitle>
          <PopoverDescription>Set the size for the layer.</PopoverDescription>
        </PopoverHeader>
        <div className="grid grid-cols-[1fr_2fr] items-center gap-2">
          <Label htmlFor="pop-width">Width</Label>
          <Input id="pop-width" defaultValue="100%" />
          <Label htmlFor="pop-height">Height</Label>
          <Input id="pop-height" defaultValue="25px" />
        </div>
      </PopoverContent>
    </Popover>
  )
}
