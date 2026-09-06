"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { FileUpload as FileUploadPrimitive } from "@ark-ui/react"
import { FileIcon, UploadIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

function FileUpload({ className, ...props }: React.ComponentProps<typeof FileUploadPrimitive.Root>) {
  return (
    <FileUploadPrimitive.Root
      data-slot="file-upload"
      className={cn("flex w-full flex-col gap-3", className)}
      {...props}
    />
  )
}

function FileUploadContext({ ...props }: React.ComponentProps<typeof FileUploadPrimitive.Context>) {
  return <FileUploadPrimitive.Context {...props} />
}

function FileUploadLabel({ className, ...props }: React.ComponentProps<typeof FileUploadPrimitive.Label>) {
  return (
    <FileUploadPrimitive.Label
      data-slot="file-upload-label"
      className={cn("text-sm font-medium select-none", className)}
      {...props}
    />
  )
}

function FileUploadDropzone({
  className,
  children,
  ...props
}: React.ComponentProps<typeof FileUploadPrimitive.Dropzone>) {
  return (
    <FileUploadPrimitive.Dropzone
      data-slot="file-upload-dropzone"
      className={cn(
        "flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-transparent p-6 text-center text-sm text-muted-foreground transition-colors outline-none hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-dragging:border-ring data-dragging:bg-muted/50 data-invalid:border-destructive dark:bg-input/30 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-5",
        className
      )}
      {...props}
    >
      {children ?? (
        <>
          <UploadIcon />
          <span>Drag your files here or click to browse</span>
        </>
      )}
    </FileUploadPrimitive.Dropzone>
  )
}

function FileUploadTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof FileUploadPrimitive.Trigger>) {
  return (
    <FileUploadPrimitive.Trigger data-slot="file-upload-trigger" className={cn(className)} asChild {...props}>
      <Button variant="outline" size="sm">
        {children}
      </Button>
    </FileUploadPrimitive.Trigger>
  )
}

function FileUploadClearTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof FileUploadPrimitive.ClearTrigger>) {
  return (
    <FileUploadPrimitive.ClearTrigger
      data-slot="file-upload-clear-trigger"
      className={cn(className)}
      asChild
      {...props}
    >
      <Button variant="ghost" size="sm">
        {children}
      </Button>
    </FileUploadPrimitive.ClearTrigger>
  )
}

function FileUploadItemGroup({ className, ...props }: React.ComponentProps<typeof FileUploadPrimitive.ItemGroup>) {
  return (
    <FileUploadPrimitive.ItemGroup
      data-slot="file-upload-item-group"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function FileUploadItem({ className, ...props }: React.ComponentProps<typeof FileUploadPrimitive.Item>) {
  return (
    <FileUploadPrimitive.Item
      data-slot="file-upload-item"
      className={cn("grid grid-cols-[auto_1fr_auto] items-center gap-x-3 rounded-lg border p-2 text-sm", className)}
      {...props}
    />
  )
}

function FileUploadItemPreview({
  className,
  children,
  ...props
}: React.ComponentProps<typeof FileUploadPrimitive.ItemPreview>) {
  return (
    <FileUploadPrimitive.ItemPreview
      data-slot="file-upload-item-preview"
      className={cn(
        "row-span-2 flex size-10 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground [&_svg]:size-5",
        className
      )}
      {...props}
    >
      {children ?? <FileIcon />}
    </FileUploadPrimitive.ItemPreview>
  )
}

function FileUploadItemPreviewImage({
  className,
  ...props
}: React.ComponentProps<typeof FileUploadPrimitive.ItemPreviewImage>) {
  return (
    <FileUploadPrimitive.ItemPreviewImage
      data-slot="file-upload-item-preview-image"
      className={cn("size-full object-cover", className)}
      {...props}
    />
  )
}

function FileUploadItemName({ className, ...props }: React.ComponentProps<typeof FileUploadPrimitive.ItemName>) {
  return (
    <FileUploadPrimitive.ItemName
      data-slot="file-upload-item-name"
      className={cn("truncate font-medium", className)}
      {...props}
    />
  )
}

function FileUploadItemSizeText({
  className,
  ...props
}: React.ComponentProps<typeof FileUploadPrimitive.ItemSizeText>) {
  return (
    <FileUploadPrimitive.ItemSizeText
      data-slot="file-upload-item-size-text"
      className={cn("col-start-2 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function FileUploadItemDeleteTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof FileUploadPrimitive.ItemDeleteTrigger>) {
  return (
    <FileUploadPrimitive.ItemDeleteTrigger
      data-slot="file-upload-item-delete-trigger"
      className={cn("row-span-2", className)}
      asChild
      {...props}
    >
      <Button variant="ghost" size="icon-sm">
        {children ?? <XIcon />}
      </Button>
    </FileUploadPrimitive.ItemDeleteTrigger>
  )
}

function FileUploadHiddenInput({ ...props }: React.ComponentProps<typeof FileUploadPrimitive.HiddenInput>) {
  return <FileUploadPrimitive.HiddenInput {...props} />
}

export {
  FileUpload,
  FileUploadClearTrigger,
  FileUploadContext,
  FileUploadDropzone,
  FileUploadHiddenInput,
  FileUploadItem,
  FileUploadItemDeleteTrigger,
  FileUploadItemGroup,
  FileUploadItemName,
  FileUploadItemPreview,
  FileUploadItemPreviewImage,
  FileUploadItemSizeText,
  FileUploadLabel,
  FileUploadTrigger,
}
