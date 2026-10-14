import { useState } from "react"
import { FlipHorizontalIcon, RotateCwIcon, RotateCcwIcon } from "lucide-react"
import { ImageCropper } from "@/components/ui/image-cropper"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

// Deterministic local calibration image: no network, upload, or cross-origin canvas dependency.
const source = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="320" height="288" viewBox="0 0 640 576"><rect width="640" height="576" fill="#cbd5e1"/><path d="M0 0H320V288H0ZM320 288H640V576H320Z" fill="#64748b"/><circle cx="320" cy="288" r="120" fill="#f1f5f9"/><path d="M280 248L360 288L280 328Z" fill="#334155"/></svg>')}`

export default function Example() {
  const [circle, setCircle] = useState(false)
  const [fixed, setFixed] = useState(false)
  return (
    <div className="w-80 max-w-full space-y-4">
      <ImageCropper.Root cropShape={circle ? "circle" : "rectangle"} fixedCropArea={fixed}>
        <ImageCropper.Viewport>
          <ImageCropper.Image src={source} alt="Calibration grid with a right-pointing arrow" />
          <ImageCropper.Selection />
        </ImageCropper.Viewport>
        <ImageCropper.Context>
          {(cropper) => (
            <>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Rotate clockwise"
                  onClick={() => cropper.rotateBy(90)}
                >
                  <RotateCwIcon />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  aria-label="Flip horizontally"
                  onClick={() => cropper.flipHorizontally()}
                >
                  <FlipHorizontalIcon />
                </Button>
                <Button variant="outline" size="icon-sm" aria-label="Reset crop" onClick={() => cropper.reset()}>
                  <RotateCcwIcon />
                </Button>
              </div>
              <Slider.Root
                min={1}
                max={5}
                step={0.1}
                value={[cropper.zoom]}
                onValueChange={({ value }) => cropper.setZoom(value[0])}
              >
                <Slider.Label>Zoom</Slider.Label>
                <Slider.Control>
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumb index={0} aria-label="Zoom">
                    <Slider.HiddenInput />
                  </Slider.Thumb>
                </Slider.Control>
              </Slider.Root>
              <output className="text-sm text-muted-foreground" data-audit-state="crop">
                {Math.round(cropper.zoom * 100)}% · {cropper.rotation}° ·{" "}
                {cropper.flip.horizontal ? "flipped" : "original"}
              </output>
              <output hidden data-audit-crop>
                {JSON.stringify(cropper.crop)}
              </output>
            </>
          )}
        </ImageCropper.Context>
      </ImageCropper.Root>
      <div className="flex gap-2">
        <Button variant="outline" aria-pressed={circle} onClick={() => setCircle(!circle)}>
          Circle crop
        </Button>
        <Button variant="outline" aria-pressed={fixed} onClick={() => setFixed(!fixed)}>
          Fixed crop area
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Arrow keys move the crop; Shift moves by 10px. Alt + arrows resize. Fixed mode pans the image instead.
      </p>
    </div>
  )
}
