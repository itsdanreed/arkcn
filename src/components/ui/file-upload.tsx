"use client"

import { useFileUpload, useFileUploadContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { FileUpload as FileUploadPrimitive } from "@ark-ui/react"
import { FileIcon, UploadIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

function FileUploadRoot({ className, ...props }: FileUploadRootProps) {
  return (
    <FileUploadPrimitive.Root
      data-slot="file-upload"
      className={cn("flex w-full flex-col gap-3", className)}
      {...props}
    />
  )
}

function FileUploadContext({ ...props }: FileUploadContextProps) {
  return <FileUploadPrimitive.Context {...props} />
}

function FileUploadLabel({ className, ...props }: FileUploadLabelProps) {
  return (
    <FileUploadPrimitive.Label
      data-slot="file-upload-label"
      className={cn("text-sm font-medium select-none", className)}
      {...props}
    />
  )
}

function FileUploadDropzone({ className, children, ...props }: FileUploadDropzoneProps) {
  return (
    <FileUploadPrimitive.Dropzone
      data-slot="file-upload-dropzone"
      className={cn(
        "flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-transparent p-6 text-center text-sm text-muted-foreground transition-colors outline-none hover:bg-muted/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-dragging:border-ring data-dragging:bg-muted/50 data-invalid:border-destructive dark:bg-input/30 data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg:not([class*='size-'])]:size-5",
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
              <UploadIcon />
              <span>Drag your files here or click to browse</span>
            </>
          )}
        </>
      )}
    </FileUploadPrimitive.Dropzone>
  )
}

function FileUploadTrigger({ className, children, ...props }: FileUploadTriggerProps) {
  return (
    <FileUploadPrimitive.Trigger data-slot="file-upload-trigger" className={cn(className)} asChild {...props}>
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          <Button variant="outline" size="sm">
            {children}
          </Button>
        </>
      )}
    </FileUploadPrimitive.Trigger>
  )
}

function FileUploadClearTrigger({ className, children, ...props }: FileUploadClearTriggerProps) {
  return (
    <FileUploadPrimitive.ClearTrigger
      data-slot="file-upload-clear-trigger"
      className={cn(className)}
      asChild
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          <Button variant="ghost" size="sm">
            {children}
          </Button>
        </>
      )}
    </FileUploadPrimitive.ClearTrigger>
  )
}

function FileUploadItemGroup({ className, ...props }: FileUploadItemGroupProps) {
  return (
    <FileUploadPrimitive.ItemGroup
      data-slot="file-upload-item-group"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  )
}

function FileUploadItem({ className, ...props }: FileUploadItemProps) {
  return (
    <FileUploadPrimitive.Item
      data-slot="file-upload-item"
      className={cn("grid grid-cols-[auto_1fr_auto] items-center gap-x-3 rounded-lg border p-2 text-sm", className)}
      {...props}
    />
  )
}

function FileUploadItemPreview({ className, children, ...props }: FileUploadItemPreviewProps) {
  return (
    <FileUploadPrimitive.ItemPreview
      data-slot="file-upload-item-preview"
      className={cn(
        "row-span-2 flex size-10 items-center justify-center overflow-hidden rounded-md bg-muted text-muted-foreground [&_svg]:size-5",
        className
      )}
      {...props}
    >
      {props.asChild ? React.isValidElement(children) ? children : null : <>{children ?? <FileIcon />}</>}
    </FileUploadPrimitive.ItemPreview>
  )
}

function FileUploadItemPreviewImage({ className, ...props }: FileUploadItemPreviewImageProps) {
  return (
    <FileUploadPrimitive.ItemPreviewImage
      data-slot="file-upload-item-preview-image"
      className={cn("size-full object-cover", className)}
      {...props}
    />
  )
}

function FileUploadItemName({ className, ...props }: FileUploadItemNameProps) {
  return (
    <FileUploadPrimitive.ItemName
      data-slot="file-upload-item-name"
      className={cn("truncate font-medium", className)}
      {...props}
    />
  )
}

function FileUploadItemSizeText({ className, ...props }: FileUploadItemSizeTextProps) {
  return (
    <FileUploadPrimitive.ItemSizeText
      data-slot="file-upload-item-size-text"
      className={cn("col-start-2 text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function FileUploadItemDeleteTrigger({ className, children, ...props }: FileUploadItemDeleteTriggerProps) {
  return (
    <FileUploadPrimitive.ItemDeleteTrigger
      data-slot="file-upload-item-delete-trigger"
      className={cn("row-span-2", className)}
      asChild
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          <Button variant="ghost" size="icon-sm">
            {children ?? <XIcon />}
          </Button>
        </>
      )}
    </FileUploadPrimitive.ItemDeleteTrigger>
  )
}

function FileUploadHiddenInput({ ...props }: FileUploadHiddenInputProps) {
  return <FileUploadPrimitive.HiddenInput {...props} />
}

function FileUploadRootProvider({ className, ...props }: FileUploadRootProviderProps) {
  return (
    <FileUploadPrimitive.RootProvider
      data-slot="file-upload"
      className={cn("flex w-full flex-col gap-3", className)}
      {...props}
    />
  )
}

type FileUploadRootProps = React.ComponentProps<typeof FileUploadPrimitive.Root>

type FileUploadRootProviderProps = React.ComponentProps<typeof FileUploadPrimitive.RootProvider>

type FileUploadClearTriggerProps = React.ComponentProps<typeof FileUploadPrimitive.ClearTrigger>

type FileUploadContextProps = React.ComponentProps<typeof FileUploadPrimitive.Context>

type FileUploadDropzoneProps = React.ComponentProps<typeof FileUploadPrimitive.Dropzone>

type FileUploadHiddenInputProps = React.ComponentProps<typeof FileUploadPrimitive.HiddenInput>

type FileUploadItemProps = React.ComponentProps<typeof FileUploadPrimitive.Item>

type FileUploadItemDeleteTriggerProps = React.ComponentProps<typeof FileUploadPrimitive.ItemDeleteTrigger>

type FileUploadItemGroupProps = React.ComponentProps<typeof FileUploadPrimitive.ItemGroup>

type FileUploadItemNameProps = React.ComponentProps<typeof FileUploadPrimitive.ItemName>

type FileUploadItemPreviewProps = React.ComponentProps<typeof FileUploadPrimitive.ItemPreview>

type FileUploadItemPreviewImageProps = React.ComponentProps<typeof FileUploadPrimitive.ItemPreviewImage>

type FileUploadItemSizeTextProps = React.ComponentProps<typeof FileUploadPrimitive.ItemSizeText>

type FileUploadLabelProps = React.ComponentProps<typeof FileUploadPrimitive.Label>

type FileUploadTriggerProps = React.ComponentProps<typeof FileUploadPrimitive.Trigger>

const FileUpload = {
  Root: FileUploadRoot,
  RootProvider: FileUploadRootProvider,
  ClearTrigger: FileUploadClearTrigger,
  Context: FileUploadContext,
  Dropzone: FileUploadDropzone,
  HiddenInput: FileUploadHiddenInput,
  Item: FileUploadItem,
  ItemDeleteTrigger: FileUploadItemDeleteTrigger,
  ItemGroup: FileUploadItemGroup,
  ItemName: FileUploadItemName,
  ItemPreview: FileUploadItemPreview,
  ItemPreviewImage: FileUploadItemPreviewImage,
  ItemSizeText: FileUploadItemSizeText,
  Label: FileUploadLabel,
  Trigger: FileUploadTrigger,
}

export {
  useFileUpload,
  useFileUploadContext,
  FileUpload,
  type FileUploadRootProps,
  type FileUploadRootProviderProps,
  type FileUploadClearTriggerProps,
  type FileUploadContextProps,
  type FileUploadDropzoneProps,
  type FileUploadHiddenInputProps,
  type FileUploadItemProps,
  type FileUploadItemDeleteTriggerProps,
  type FileUploadItemGroupProps,
  type FileUploadItemNameProps,
  type FileUploadItemPreviewProps,
  type FileUploadItemPreviewImageProps,
  type FileUploadItemSizeTextProps,
  type FileUploadLabelProps,
  type FileUploadTriggerProps,
}
