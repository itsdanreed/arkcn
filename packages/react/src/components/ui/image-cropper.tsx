"use client"

import { useImageCropper, useImageCropperContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "../../lib/utils"
import { ImageCropper as ImageCropperPrimitive } from "@ark-ui/react"

const handlePositions = ["n", "e", "s", "w", "ne", "se", "sw", "nw"] as const

function ImageCropperRoot({ className, ...props }: ImageCropperRootProps) {
  return (
    <ImageCropperPrimitive.Root
      data-slot="image-cropper"
      className={cn("flex w-full flex-col gap-2", className)}
      {...props}
    />
  )
}

function ImageCropperContext({ ...props }: ImageCropperContextProps) {
  return <ImageCropperPrimitive.Context {...props} />
}

function ImageCropperViewport({ className, ...props }: ImageCropperViewportProps) {
  return (
    <ImageCropperPrimitive.Viewport
      data-slot="image-cropper-viewport"
      className={cn(
        "relative h-72 w-full touch-none overflow-hidden rounded-xl border bg-muted select-none",
        className
      )}
      {...props}
    />
  )
}

function ImageCropperImage({ className, ...props }: ImageCropperImageProps) {
  return (
    <ImageCropperPrimitive.Image data-slot="image-cropper-image" className={cn("max-w-none", className)} {...props} />
  )
}

function ImageCropperSelection({ className, children, ...props }: ImageCropperSelectionProps) {
  return (
    <ImageCropperPrimitive.Selection
      data-slot="image-cropper-selection"
      className={cn(
        "shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] ring-ring/50 outline-1 outline-white/80 focus-visible:ring-3 focus-visible:outline-ring data-[shape=circle]:rounded-full",
        className
      )}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          {children ?? (
            <>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
              >
                <ImageCropperGrid axis="horizontal" />
                <ImageCropperGrid axis="vertical" />
              </div>
              {handlePositions.map((position) => (
                <ImageCropperHandle key={position} position={position} />
              ))}
            </>
          )}
        </>
      )}
    </ImageCropperPrimitive.Selection>
  )
}

function ImageCropperGrid({ className, ...props }: ImageCropperGridProps) {
  return (
    <ImageCropperPrimitive.Grid
      data-slot="image-cropper-grid"
      className={cn("border-white/50 data-[axis=horizontal]:border-y data-[axis=vertical]:border-x", className)}
      {...props}
    />
  )
}

function ImageCropperHandle({ className, style, ...props }: ImageCropperHandleProps) {
  const { crop, viewportRect } = useImageCropperContext()
  // Keep the dot and its hover ring inside the rounded viewport at the crop limits.
  // Away from those limits, retain Ark's position on the actual selection edge.
  const clearance = 12
  const inset = (space: number) => Math.max(0, clearance - space)
  const edgeStyle: React.CSSProperties = {
    ...(props.position.includes("n") && { top: inset(crop.y) }),
    ...(props.position.includes("s") && { bottom: inset(viewportRect.height - crop.y - crop.height) }),
    ...(props.position.includes("w") && { left: inset(crop.x) }),
    ...(props.position.includes("e") && { right: inset(viewportRect.width - crop.x - crop.width) }),
  }
  return (
    <ImageCropperPrimitive.Handle
      data-slot="image-cropper-handle"
      style={{ ...edgeStyle, ...style }}
      className={cn(
        "min-h-3 min-w-3 after:absolute after:top-1/2 after:left-1/2 after:size-3 after:-translate-1/2 after:rounded-full after:border after:border-ring after:bg-white after:ring-ring/50 after:transition-[color,box-shadow] hover:after:ring-3 active:after:ring-3 data-[position=e]:after:h-4 data-[position=e]:after:w-1 data-[position=n]:after:h-1 data-[position=n]:after:w-4 data-[position=s]:after:h-1 data-[position=s]:after:w-4 data-[position=w]:after:h-4 data-[position=w]:after:w-1 data-disabled:hidden",
        className
      )}
      {...props}
    />
  )
}

function ImageCropperRootProvider({ className, ...props }: ImageCropperRootProviderProps) {
  return (
    <ImageCropperPrimitive.RootProvider
      data-slot="image-cropper"
      className={cn("flex w-full flex-col gap-2", className)}
      {...props}
    />
  )
}

type ImageCropperRootProps = React.ComponentProps<typeof ImageCropperPrimitive.Root>

type ImageCropperRootProviderProps = React.ComponentProps<typeof ImageCropperPrimitive.RootProvider>

type ImageCropperContextProps = React.ComponentProps<typeof ImageCropperPrimitive.Context>

type ImageCropperGridProps = React.ComponentProps<typeof ImageCropperPrimitive.Grid>

type ImageCropperHandleProps = React.ComponentProps<typeof ImageCropperPrimitive.Handle>

type ImageCropperImageProps = React.ComponentProps<typeof ImageCropperPrimitive.Image>

type ImageCropperSelectionProps = React.ComponentProps<typeof ImageCropperPrimitive.Selection>

type ImageCropperViewportProps = React.ComponentProps<typeof ImageCropperPrimitive.Viewport>

const ImageCropper = {
  Root: ImageCropperRoot,
  RootProvider: ImageCropperRootProvider,
  Context: ImageCropperContext,
  Grid: ImageCropperGrid,
  Handle: ImageCropperHandle,
  Image: ImageCropperImage,
  Selection: ImageCropperSelection,
  Viewport: ImageCropperViewport,
}

export {
  useImageCropper,
  useImageCropperContext,
  ImageCropper,
  type ImageCropperRootProps,
  type ImageCropperRootProviderProps,
  type ImageCropperContextProps,
  type ImageCropperGridProps,
  type ImageCropperHandleProps,
  type ImageCropperImageProps,
  type ImageCropperSelectionProps,
  type ImageCropperViewportProps,
}
