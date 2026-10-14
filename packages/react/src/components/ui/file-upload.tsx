"use client"

import { useFileUpload, useFileUploadContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "../../lib/utils"
import { FileUpload as FileUploadPrimitive } from "@ark-ui/react"
import { FileIcon, UploadIcon, XIcon } from "lucide-react"

import { Button, buttonVariants } from "./button"
import { Empty } from "./empty"

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
      className={cn("text-sm/none font-medium select-none", className)}
      {...props}
    />
  )
}

function FileUploadDropzone({ className, children, ...props }: FileUploadDropzoneProps) {
  return (
    <FileUploadPrimitive.Dropzone
      data-slot="file-upload-dropzone"
      className={cn(
        buttonVariants({ variant: "outline" }),
        "h-auto min-h-32 w-full cursor-pointer flex-col gap-4 rounded-xl border-dashed p-6 text-center text-balance whitespace-normal aria-disabled:pointer-events-none aria-disabled:opacity-50 data-dragging:border-ring data-dragging:bg-muted data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20 dark:data-invalid:border-destructive/50 dark:data-invalid:ring-destructive/40",
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
            <Empty.Header>
              <Empty.Media variant="icon">
                <UploadIcon />
              </Empty.Media>
              <Empty.Description>Drag your files here or click to browse</Empty.Description>
            </Empty.Header>
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
        <Button variant="outline" size="sm">
          {children}
        </Button>
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
        <Button variant="ghost" size="sm">
          {children}
        </Button>
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
      className={cn(
        "relative grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)_auto] grid-rows-[auto_auto] items-center gap-x-2 rounded-xl border bg-card p-2 text-sm text-card-foreground transition-colors focus-within:ring-1 focus-within:ring-ring/50",
        className
      )}
      {...props}
    />
  )
}

function FileUploadItemPreview({ className, children, ...props }: FileUploadItemPreviewProps) {
  return (
    <FileUploadPrimitive.ItemPreview
      data-slot="file-upload-item-preview"
      className={cn(
        "col-start-1 row-span-2 row-start-1 flex size-10 items-center justify-center overflow-hidden rounded-lg bg-muted text-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4",
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
      className={cn("col-start-2 row-start-1 min-w-0 self-end truncate leading-tight font-medium", className)}
      {...props}
    />
  )
}

function FileUploadItemSizeText({ className, ...props }: FileUploadItemSizeTextProps) {
  return (
    <FileUploadPrimitive.ItemSizeText
      data-slot="file-upload-item-size-text"
      className={cn(
        "col-start-2 row-start-2 mt-0.5 min-w-0 self-start truncate text-xs text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}

function FileUploadItemDeleteTrigger({ className, children, ...props }: FileUploadItemDeleteTriggerProps) {
  return (
    <FileUploadPrimitive.ItemDeleteTrigger
      data-slot="file-upload-item-delete-trigger"
      className={cn("col-start-3 row-span-2 row-start-1", className)}
      asChild
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <Button variant="ghost" size="icon-xs">
          {children ?? <XIcon />}
        </Button>
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
