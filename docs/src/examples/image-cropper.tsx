import { ImageCropper } from "@/components/ui/image-cropper"

export default function ImageCropperExample() {
  return (
    <ImageCropper.Root className="w-80">
      <ImageCropper.Viewport>
        <ImageCropper.Image src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800" alt="Landscape" />
        <ImageCropper.Selection />
      </ImageCropper.Viewport>
    </ImageCropper.Root>
  )
}
