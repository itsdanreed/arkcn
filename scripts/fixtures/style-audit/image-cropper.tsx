import { useState } from "react"
import { FlipHorizontalIcon, RotateCwIcon, RotateCcwIcon } from "lucide-react"
import { Button } from "../ui/button"
import { Slider } from "../ui/slider"
import { Label } from "../ui/label"

export default function Example() {
  const [zoom, setZoom] = useState([1])
  const [rotation, setRotation] = useState(0)
  const [flip, setFlip] = useState(false)
  const [circle, setCircle] = useState(false)
  const [fixed, setFixed] = useState(false)
  return (
    <div className="w-80 max-w-full space-y-4">
      <p className="text-sm text-muted-foreground">
        Shadcn supplies the controls below; it has no image cropper, crop mask, or resize grid.
      </p>
      <div className="space-y-2">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Rotate clockwise"
            onClick={() => setRotation((rotation + 90) % 360)}
          >
            <RotateCwIcon />
          </Button>
          <Button variant="outline" size="icon-sm" aria-label="Flip horizontally" onClick={() => setFlip(!flip)}>
            <FlipHorizontalIcon />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Reset crop"
            onClick={() => {
              setZoom([1])
              setRotation(0)
              setFlip(false)
            }}
          >
            <RotateCcwIcon />
          </Button>
        </div>
        <div className="space-y-2">
          <Label id="crop-zoom">Zoom</Label>
          <Slider
            min={1}
            max={5}
            step={0.1}
            value={zoom}
            onValueChange={(value) => setZoom(Array.isArray(value) ? value : [value])}
            aria-labelledby="crop-zoom"
          />
        </div>
        <output className="text-sm text-muted-foreground">
          {Math.round(zoom[0] * 100)}% · {rotation}° · {flip ? "flipped" : "original"}
        </output>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" aria-pressed={circle} onClick={() => setCircle(!circle)}>
          Circle crop
        </Button>
        <Button variant="outline" aria-pressed={fixed} onClick={() => setFixed(!fixed)}>
          Fixed crop area
        </Button>
      </div>
    </div>
  )
}
