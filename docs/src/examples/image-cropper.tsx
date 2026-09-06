import {
  ImageCropper,
  ImageCropperImage,
  ImageCropperSelection,
  ImageCropperViewport,
} from "@/components/ui/image-cropper"

export default function ImageCropperExample() {
  return (
    <ImageCropper className="w-80">
      <ImageCropperViewport>
        <ImageCropperImage src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=800" alt="Landscape" />
        <ImageCropperSelection />
      </ImageCropperViewport>
    </ImageCropper>
  )
}
