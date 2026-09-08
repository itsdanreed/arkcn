"use client"

import { useImageCropper, useImageCropperContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
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
        "shadow-[0_0_0_9999px_rgba(0,0,0,0.45)] outline-1 outline-white/80 data-[shape=circle]:rounded-full",
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
              <ImageCropperGrid axis="horizontal" />
              <ImageCropperGrid axis="vertical" />
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
      className={cn("stroke-white/50", className)}
      {...props}
    />
  )
}

function ImageCropperHandle({ className, ...props }: ImageCropperHandleProps) {
  return (
    <ImageCropperPrimitive.Handle
      data-slot="image-cropper-handle"
      className={cn(
        "after:absolute after:top-1/2 after:left-1/2 after:size-2.5 after:-translate-1/2 after:rounded-full after:border after:border-ring after:bg-white data-[axis=x]:after:h-4 data-[axis=x]:after:w-1 data-[axis=y]:after:h-1 data-[axis=y]:after:w-4",
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
