"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ColorPicker as ColorPickerPrimitive, Portal as PortalPrimitive, parseColor } from "@ark-ui/react"
import { PipetteIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

function ColorPicker({
  className,
  positioning,
  lazyMount = true,
  unmountOnExit = true,
  ...props
}: React.ComponentProps<typeof ColorPickerPrimitive.Root>) {
  return (
    <ColorPickerPrimitive.Root
      data-slot="color-picker"
      positioning={{ placement: "bottom-start", gutter: 4, ...positioning }}
      lazyMount={lazyMount}
      unmountOnExit={unmountOnExit}
      className={cn("flex w-full flex-col gap-1.5", className)}
      {...props}
    />
  )
}

function ColorPickerContext({ ...props }: React.ComponentProps<typeof ColorPickerPrimitive.Context>) {
  return <ColorPickerPrimitive.Context {...props} />
}

function ColorPickerLabel({ className, ...props }: React.ComponentProps<typeof ColorPickerPrimitive.Label>) {
  return (
    <ColorPickerPrimitive.Label
      data-slot="color-picker-label"
      className={cn("text-sm font-medium select-none", className)}
      {...props}
    />
  )
}

function ColorPickerControl({ className, ...props }: React.ComponentProps<typeof ColorPickerPrimitive.Control>) {
  return (
    <ColorPickerPrimitive.Control
      data-slot="color-picker-control"
      className={cn("flex items-center gap-1.5", className)}
      {...props}
    />
  )
}

function ColorPickerChannelInput({
  className,
  ...props
}: React.ComponentProps<typeof ColorPickerPrimitive.ChannelInput>) {
  return (
    <ColorPickerPrimitive.ChannelInput
      data-slot="color-picker-channel-input"
      className={cn(
        "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 data-invalid:border-destructive dark:bg-input/30",
        className
      )}
      {...props}
    />
  )
}

function ColorPickerTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ColorPickerPrimitive.Trigger>) {
  return (
    <ColorPickerPrimitive.Trigger
      data-slot="color-picker-trigger"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg border border-input bg-transparent p-1 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children ?? (
        <ColorPickerTransparencyGrid className="rounded-sm">
          <ColorPickerValueSwatch />
        </ColorPickerTransparencyGrid>
      )}
    </ColorPickerPrimitive.Trigger>
  )
}

function ColorPickerValueSwatch({
  className,
  ...props
}: React.ComponentProps<typeof ColorPickerPrimitive.ValueSwatch>) {
  return (
    <ColorPickerPrimitive.ValueSwatch
      data-slot="color-picker-value-swatch"
      className={cn("size-full rounded-sm", className)}
      {...props}
    />
  )
}

function ColorPickerValueText({ className, ...props }: React.ComponentProps<typeof ColorPickerPrimitive.ValueText>) {
  return (
    <ColorPickerPrimitive.ValueText
      data-slot="color-picker-value-text"
      className={cn("font-mono text-sm", className)}
      {...props}
    />
  )
}

function ColorPickerTransparencyGrid({
  className,
  ...props
}: React.ComponentProps<typeof ColorPickerPrimitive.TransparencyGrid>) {
  return (
    <ColorPickerPrimitive.TransparencyGrid
      data-slot="color-picker-transparency-grid"
      className={cn("size-full overflow-hidden", className)}
      {...props}
    />
  )
}

function ColorPickerPortal({ ...props }: React.ComponentProps<typeof PortalPrimitive>) {
  return <PortalPrimitive {...props} />
}

function ColorPickerPositioner({ className, ...props }: React.ComponentProps<typeof ColorPickerPrimitive.Positioner>) {
  return (
    <ColorPickerPrimitive.Positioner
      data-slot="color-picker-positioner"
      className={cn("[--z-index:50]", className)}
      {...props}
    />
  )
}

function ColorPickerContent({ className, ...props }: React.ComponentProps<typeof ColorPickerPrimitive.Content>) {
  return (
    <ColorPickerPortal>
      <ColorPickerPositioner>
        <ColorPickerPrimitive.Content
          data-slot="color-picker-content"
          className={cn(
            "z-50 flex w-64 flex-col gap-3 rounded-lg bg-popover p-3 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-hidden duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className
          )}
          {...props}
        />
      </ColorPickerPositioner>
    </ColorPickerPortal>
  )
}

function ColorPickerArea({ className, children, ...props }: React.ComponentProps<typeof ColorPickerPrimitive.Area>) {
  return (
    <ColorPickerPrimitive.Area
      data-slot="color-picker-area"
      className={cn("h-40 w-full overflow-hidden rounded-md", className)}
      {...props}
    >
      {children ?? (
        <>
          <ColorPickerAreaBackground />
          <ColorPickerAreaThumb />
        </>
      )}
    </ColorPickerPrimitive.Area>
  )
}

function ColorPickerAreaBackground({
  className,
  ...props
}: React.ComponentProps<typeof ColorPickerPrimitive.AreaBackground>) {
  return (
    <ColorPickerPrimitive.AreaBackground
      data-slot="color-picker-area-background"
      className={cn("size-full", className)}
      {...props}
    />
  )
}

function ColorPickerAreaThumb({ className, ...props }: React.ComponentProps<typeof ColorPickerPrimitive.AreaThumb>) {
  return (
    <ColorPickerPrimitive.AreaThumb
      data-slot="color-picker-area-thumb"
      className={cn(
        "size-3 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)] outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
      {...props}
    />
  )
}

function ColorPickerChannelSlider({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ColorPickerPrimitive.ChannelSlider>) {
  return (
    <ColorPickerPrimitive.ChannelSlider
      data-slot="color-picker-channel-slider"
      className={cn("relative h-3 w-full", className)}
      {...props}
    >
      {children ?? (
        <>
          <ColorPickerChannelSliderTrack />
          <ColorPickerChannelSliderThumb />
        </>
      )}
    </ColorPickerPrimitive.ChannelSlider>
  )
}

function ColorPickerChannelSliderTrack({
  className,
  ...props
}: React.ComponentProps<typeof ColorPickerPrimitive.ChannelSliderTrack>) {
  return (
    <ColorPickerPrimitive.ChannelSliderTrack
      data-slot="color-picker-channel-slider-track"
      className={cn("size-full rounded-full", className)}
      {...props}
    />
  )
}

function ColorPickerChannelSliderThumb({
  className,
  ...props
}: React.ComponentProps<typeof ColorPickerPrimitive.ChannelSliderThumb>) {
  return (
    <ColorPickerPrimitive.ChannelSliderThumb
      data-slot="color-picker-channel-slider-thumb"
      className={cn(
        "size-3 -translate-1/2 rounded-full border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.3)] outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        className
      )}
      {...props}
    />
  )
}

function ColorPickerChannelSliderLabel({
  className,
  ...props
}: React.ComponentProps<typeof ColorPickerPrimitive.ChannelSliderLabel>) {
  return (
    <ColorPickerPrimitive.ChannelSliderLabel
      data-slot="color-picker-channel-slider-label"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function ColorPickerChannelSliderValueText({
  className,
  ...props
}: React.ComponentProps<typeof ColorPickerPrimitive.ChannelSliderValueText>) {
  return (
    <ColorPickerPrimitive.ChannelSliderValueText
      data-slot="color-picker-channel-slider-value-text"
      className={cn("text-xs tabular-nums", className)}
      {...props}
    />
  )
}

function ColorPickerEyeDropperTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ColorPickerPrimitive.EyeDropperTrigger>) {
  return (
    <ColorPickerPrimitive.EyeDropperTrigger
      data-slot="color-picker-eye-dropper-trigger"
      className={cn(className)}
      asChild
      {...props}
    >
      <Button variant="outline" size="icon-sm">
        {children ?? <PipetteIcon />}
        <span className="sr-only">Pick color</span>
      </Button>
    </ColorPickerPrimitive.EyeDropperTrigger>
  )
}

function ColorPickerFormatTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ColorPickerPrimitive.FormatTrigger>) {
  return (
    <ColorPickerPrimitive.FormatTrigger
      data-slot="color-picker-format-trigger"
      className={cn(className)}
      asChild
      {...props}
    >
      <Button variant="outline" size="sm">
        {children}
      </Button>
    </ColorPickerPrimitive.FormatTrigger>
  )
}

function ColorPickerFormatSelect({
  className,
  ...props
}: React.ComponentProps<typeof ColorPickerPrimitive.FormatSelect>) {
  return (
    <ColorPickerPrimitive.FormatSelect
      data-slot="color-picker-format-select"
      className={cn(
        "h-7 rounded-md border border-input bg-transparent px-1.5 text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30",
        className
      )}
      {...props}
    />
  )
}

function ColorPickerView({ className, ...props }: React.ComponentProps<typeof ColorPickerPrimitive.View>) {
  return (
    <ColorPickerPrimitive.View
      data-slot="color-picker-view"
      className={cn("flex items-center gap-1.5", className)}
      {...props}
    />
  )
}

function ColorPickerSwatchGroup({
  className,
  ...props
}: React.ComponentProps<typeof ColorPickerPrimitive.SwatchGroup>) {
  return (
    <ColorPickerPrimitive.SwatchGroup
      data-slot="color-picker-swatch-group"
      className={cn("flex flex-wrap gap-1.5", className)}
      {...props}
    />
  )
}

function ColorPickerSwatchTrigger({
  className,
  children,
  value,
  ...props
}: React.ComponentProps<typeof ColorPickerPrimitive.SwatchTrigger>) {
  return (
    <ColorPickerPrimitive.SwatchTrigger
      data-slot="color-picker-swatch-trigger"
      value={value}
      className={cn("size-6 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50", className)}
      {...props}
    >
      {children ?? (
        <ColorPickerTransparencyGrid className="rounded-md">
          <ColorPickerSwatch value={value}>
            <ColorPickerSwatchIndicator />
          </ColorPickerSwatch>
        </ColorPickerTransparencyGrid>
      )}
    </ColorPickerPrimitive.SwatchTrigger>
  )
}

function ColorPickerSwatch({ className, ...props }: React.ComponentProps<typeof ColorPickerPrimitive.Swatch>) {
  return (
    <ColorPickerPrimitive.Swatch
      data-slot="color-picker-swatch"
      className={cn("flex size-full items-center justify-center rounded-[inherit]", className)}
      {...props}
    />
  )
}

function ColorPickerSwatchIndicator({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ColorPickerPrimitive.SwatchIndicator>) {
  return (
    <ColorPickerPrimitive.SwatchIndicator
      data-slot="color-picker-swatch-indicator"
      className={cn("size-2 rounded-full bg-white shadow-sm", className)}
      {...props}
    >
      {children}
    </ColorPickerPrimitive.SwatchIndicator>
  )
}

function ColorPickerHiddenInput({ ...props }: React.ComponentProps<typeof ColorPickerPrimitive.HiddenInput>) {
  return <ColorPickerPrimitive.HiddenInput {...props} />
}

export {
  ColorPicker,
  ColorPickerArea,
  ColorPickerAreaBackground,
  ColorPickerAreaThumb,
  ColorPickerChannelInput,
  ColorPickerChannelSlider,
  ColorPickerChannelSliderLabel,
  ColorPickerChannelSliderThumb,
  ColorPickerChannelSliderTrack,
  ColorPickerChannelSliderValueText,
  ColorPickerContent,
  ColorPickerContext,
  ColorPickerControl,
  ColorPickerEyeDropperTrigger,
  ColorPickerFormatSelect,
  ColorPickerFormatTrigger,
  ColorPickerHiddenInput,
  ColorPickerLabel,
  ColorPickerPortal,
  ColorPickerPositioner,
  ColorPickerSwatch,
  ColorPickerSwatchGroup,
  ColorPickerSwatchIndicator,
  ColorPickerSwatchTrigger,
  ColorPickerTransparencyGrid,
  ColorPickerTrigger,
  ColorPickerValueSwatch,
  ColorPickerValueText,
  ColorPickerView,
  parseColor,
}
