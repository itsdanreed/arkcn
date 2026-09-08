"use client"

import { useColorPicker, useColorPickerContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { ColorPicker as ColorPickerPrimitive, Portal as PortalPrimitive, parseColor } from "@ark-ui/react"
import { PipetteIcon } from "lucide-react"

import { Button } from "@/components/ui/button"

function ColorPickerRoot({
  className,
  positioning,
  lazyMount = true,
  unmountOnExit = true,
  ...props
}: ColorPickerRootProps) {
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

function ColorPickerContext({ ...props }: ColorPickerContextProps) {
  return <ColorPickerPrimitive.Context {...props} />
}

function ColorPickerLabel({ className, ...props }: ColorPickerLabelProps) {
  return (
    <ColorPickerPrimitive.Label
      data-slot="color-picker-label"
      className={cn("text-sm font-medium select-none", className)}
      {...props}
    />
  )
}

function ColorPickerControl({ className, ...props }: ColorPickerControlProps) {
  return (
    <ColorPickerPrimitive.Control
      data-slot="color-picker-control"
      className={cn("flex items-center gap-1.5", className)}
      {...props}
    />
  )
}

function ColorPickerChannelInput({ className, ...props }: ColorPickerChannelInputProps) {
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

function ColorPickerTrigger({ className, children, ...props }: ColorPickerTriggerProps) {
  return (
    <ColorPickerPrimitive.Trigger
      data-slot="color-picker-trigger"
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-lg border border-input bg-transparent p-1 outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30 data-disabled:opacity-50",
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
            <ColorPickerTransparencyGrid className="rounded-sm">
              <ColorPickerValueSwatch />
            </ColorPickerTransparencyGrid>
          )}
        </>
      )}
    </ColorPickerPrimitive.Trigger>
  )
}

function ColorPickerValueSwatch({ className, ...props }: ColorPickerValueSwatchProps) {
  return (
    <ColorPickerPrimitive.ValueSwatch
      data-slot="color-picker-value-swatch"
      className={cn("size-full rounded-sm", className)}
      {...props}
    />
  )
}

function ColorPickerValueText({ className, ...props }: ColorPickerValueTextProps) {
  return (
    <ColorPickerPrimitive.ValueText
      data-slot="color-picker-value-text"
      className={cn("font-mono text-sm", className)}
      {...props}
    />
  )
}

function ColorPickerTransparencyGrid({ className, ...props }: ColorPickerTransparencyGridProps) {
  return (
    <ColorPickerPrimitive.TransparencyGrid
      data-slot="color-picker-transparency-grid"
      className={cn("size-full overflow-hidden", className)}
      {...props}
    />
  )
}

function ColorPickerPortal({ ...props }: ColorPickerPortalProps) {
  return <PortalPrimitive {...props} />
}

function ColorPickerPositioner({ className, ...props }: ColorPickerPositionerProps) {
  return (
    <ColorPickerPrimitive.Positioner
      data-slot="color-picker-positioner"
      className={cn("[--z-index:50]", className)}
      {...props}
    />
  )
}

function ColorPickerContent({ className, ...props }: ColorPickerContentProps) {
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

function ColorPickerArea({ className, children, ...props }: ColorPickerAreaProps) {
  return (
    <ColorPickerPrimitive.Area
      data-slot="color-picker-area"
      className={cn("h-40 w-full overflow-hidden rounded-md", className)}
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
              <ColorPickerAreaBackground />
              <ColorPickerAreaThumb />
            </>
          )}
        </>
      )}
    </ColorPickerPrimitive.Area>
  )
}

function ColorPickerAreaBackground({ className, ...props }: ColorPickerAreaBackgroundProps) {
  return (
    <ColorPickerPrimitive.AreaBackground
      data-slot="color-picker-area-background"
      className={cn("size-full", className)}
      {...props}
    />
  )
}

function ColorPickerAreaThumb({ className, ...props }: ColorPickerAreaThumbProps) {
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

function ColorPickerChannelSlider({ className, children, ...props }: ColorPickerChannelSliderProps) {
  return (
    <ColorPickerPrimitive.ChannelSlider
      data-slot="color-picker-channel-slider"
      className={cn("relative h-3 w-full", className)}
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
              <ColorPickerChannelSliderTrack />
              <ColorPickerChannelSliderThumb />
            </>
          )}
        </>
      )}
    </ColorPickerPrimitive.ChannelSlider>
  )
}

function ColorPickerChannelSliderTrack({ className, ...props }: ColorPickerChannelSliderTrackProps) {
  return (
    <ColorPickerPrimitive.ChannelSliderTrack
      data-slot="color-picker-channel-slider-track"
      className={cn("size-full rounded-full", className)}
      {...props}
    />
  )
}

function ColorPickerChannelSliderThumb({ className, ...props }: ColorPickerChannelSliderThumbProps) {
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

function ColorPickerChannelSliderLabel({ className, ...props }: ColorPickerChannelSliderLabelProps) {
  return (
    <ColorPickerPrimitive.ChannelSliderLabel
      data-slot="color-picker-channel-slider-label"
      className={cn("text-xs text-muted-foreground", className)}
      {...props}
    />
  )
}

function ColorPickerChannelSliderValueText({ className, ...props }: ColorPickerChannelSliderValueTextProps) {
  return (
    <ColorPickerPrimitive.ChannelSliderValueText
      data-slot="color-picker-channel-slider-value-text"
      className={cn("text-xs tabular-nums", className)}
      {...props}
    />
  )
}

function ColorPickerEyeDropperTrigger({ className, children, ...props }: ColorPickerEyeDropperTriggerProps) {
  return (
    <ColorPickerPrimitive.EyeDropperTrigger
      data-slot="color-picker-eye-dropper-trigger"
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
          <Button variant="outline" size="icon-sm">
            {children ?? <PipetteIcon />}
            <span className="sr-only">Pick color</span>
          </Button>
        </>
      )}
    </ColorPickerPrimitive.EyeDropperTrigger>
  )
}

function ColorPickerFormatTrigger({ className, children, ...props }: ColorPickerFormatTriggerProps) {
  return (
    <ColorPickerPrimitive.FormatTrigger
      data-slot="color-picker-format-trigger"
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
          <Button variant="outline" size="sm">
            {children}
          </Button>
        </>
      )}
    </ColorPickerPrimitive.FormatTrigger>
  )
}

function ColorPickerFormatSelect({ className, ...props }: ColorPickerFormatSelectProps) {
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

function ColorPickerView({ className, ...props }: ColorPickerViewProps) {
  return (
    <ColorPickerPrimitive.View
      data-slot="color-picker-view"
      className={cn("flex items-center gap-1.5", className)}
      {...props}
    />
  )
}

function ColorPickerSwatchGroup({ className, ...props }: ColorPickerSwatchGroupProps) {
  return (
    <ColorPickerPrimitive.SwatchGroup
      data-slot="color-picker-swatch-group"
      className={cn("flex flex-wrap gap-1.5", className)}
      {...props}
    />
  )
}

function ColorPickerSwatchTrigger({ className, children, value, ...props }: ColorPickerSwatchTriggerProps) {
  return (
    <ColorPickerPrimitive.SwatchTrigger
      data-slot="color-picker-swatch-trigger"
      value={value}
      className={cn("size-6 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50", className)}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          {children ?? (
            <ColorPickerTransparencyGrid className="rounded-md">
              <ColorPickerSwatch value={value}>
                <ColorPickerSwatchIndicator />
              </ColorPickerSwatch>
            </ColorPickerTransparencyGrid>
          )}
        </>
      )}
    </ColorPickerPrimitive.SwatchTrigger>
  )
}

function ColorPickerSwatch({ className, ...props }: ColorPickerSwatchProps) {
  return (
    <ColorPickerPrimitive.Swatch
      data-slot="color-picker-swatch"
      className={cn("flex size-full items-center justify-center rounded-[inherit]", className)}
      {...props}
    />
  )
}

function ColorPickerSwatchIndicator({ className, children, ...props }: ColorPickerSwatchIndicatorProps) {
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

function ColorPickerHiddenInput({ ...props }: ColorPickerHiddenInputProps) {
  return <ColorPickerPrimitive.HiddenInput {...props} />
}

function ColorPickerRootProvider({ className, ...props }: ColorPickerRootProviderProps) {
  return (
    <ColorPickerPrimitive.RootProvider
      data-slot="color-picker"
      className={cn("flex w-full flex-col gap-1.5", className)}
      {...props}
    />
  )
}

type ColorPickerRootProps = React.ComponentProps<typeof ColorPickerPrimitive.Root>

type ColorPickerRootProviderProps = React.ComponentProps<typeof ColorPickerPrimitive.RootProvider>

type ColorPickerAreaProps = React.ComponentProps<typeof ColorPickerPrimitive.Area>

type ColorPickerAreaBackgroundProps = React.ComponentProps<typeof ColorPickerPrimitive.AreaBackground>

type ColorPickerAreaThumbProps = React.ComponentProps<typeof ColorPickerPrimitive.AreaThumb>

type ColorPickerChannelInputProps = React.ComponentProps<typeof ColorPickerPrimitive.ChannelInput>

type ColorPickerChannelSliderProps = React.ComponentProps<typeof ColorPickerPrimitive.ChannelSlider>

type ColorPickerChannelSliderLabelProps = React.ComponentProps<typeof ColorPickerPrimitive.ChannelSliderLabel>

type ColorPickerChannelSliderThumbProps = React.ComponentProps<typeof ColorPickerPrimitive.ChannelSliderThumb>

type ColorPickerChannelSliderTrackProps = React.ComponentProps<typeof ColorPickerPrimitive.ChannelSliderTrack>

type ColorPickerChannelSliderValueTextProps = React.ComponentProps<typeof ColorPickerPrimitive.ChannelSliderValueText>

type ColorPickerContentProps = React.ComponentProps<typeof ColorPickerPrimitive.Content>

type ColorPickerContextProps = React.ComponentProps<typeof ColorPickerPrimitive.Context>

type ColorPickerControlProps = React.ComponentProps<typeof ColorPickerPrimitive.Control>

type ColorPickerEyeDropperTriggerProps = React.ComponentProps<typeof ColorPickerPrimitive.EyeDropperTrigger>

type ColorPickerFormatSelectProps = React.ComponentProps<typeof ColorPickerPrimitive.FormatSelect>

type ColorPickerFormatTriggerProps = React.ComponentProps<typeof ColorPickerPrimitive.FormatTrigger>

type ColorPickerHiddenInputProps = React.ComponentProps<typeof ColorPickerPrimitive.HiddenInput>

type ColorPickerLabelProps = React.ComponentProps<typeof ColorPickerPrimitive.Label>

type ColorPickerPortalProps = React.ComponentProps<typeof PortalPrimitive>

type ColorPickerPositionerProps = React.ComponentProps<typeof ColorPickerPrimitive.Positioner>

type ColorPickerSwatchProps = React.ComponentProps<typeof ColorPickerPrimitive.Swatch>

type ColorPickerSwatchGroupProps = React.ComponentProps<typeof ColorPickerPrimitive.SwatchGroup>

type ColorPickerSwatchIndicatorProps = React.ComponentProps<typeof ColorPickerPrimitive.SwatchIndicator>

type ColorPickerSwatchTriggerProps = React.ComponentProps<typeof ColorPickerPrimitive.SwatchTrigger>

type ColorPickerTransparencyGridProps = React.ComponentProps<typeof ColorPickerPrimitive.TransparencyGrid>

type ColorPickerTriggerProps = React.ComponentProps<typeof ColorPickerPrimitive.Trigger>

type ColorPickerValueSwatchProps = React.ComponentProps<typeof ColorPickerPrimitive.ValueSwatch>

type ColorPickerValueTextProps = React.ComponentProps<typeof ColorPickerPrimitive.ValueText>

type ColorPickerViewProps = React.ComponentProps<typeof ColorPickerPrimitive.View>

const ColorPicker = {
  Root: ColorPickerRoot,
  RootProvider: ColorPickerRootProvider,
  Area: ColorPickerArea,
  AreaBackground: ColorPickerAreaBackground,
  AreaThumb: ColorPickerAreaThumb,
  ChannelInput: ColorPickerChannelInput,
  ChannelSlider: ColorPickerChannelSlider,
  ChannelSliderLabel: ColorPickerChannelSliderLabel,
  ChannelSliderThumb: ColorPickerChannelSliderThumb,
  ChannelSliderTrack: ColorPickerChannelSliderTrack,
  ChannelSliderValueText: ColorPickerChannelSliderValueText,
  Content: ColorPickerContent,
  Context: ColorPickerContext,
  Control: ColorPickerControl,
  EyeDropperTrigger: ColorPickerEyeDropperTrigger,
  FormatSelect: ColorPickerFormatSelect,
  FormatTrigger: ColorPickerFormatTrigger,
  HiddenInput: ColorPickerHiddenInput,
  Label: ColorPickerLabel,
  Portal: ColorPickerPortal,
  Positioner: ColorPickerPositioner,
  Swatch: ColorPickerSwatch,
  SwatchGroup: ColorPickerSwatchGroup,
  SwatchIndicator: ColorPickerSwatchIndicator,
  SwatchTrigger: ColorPickerSwatchTrigger,
  TransparencyGrid: ColorPickerTransparencyGrid,
  Trigger: ColorPickerTrigger,
  ValueSwatch: ColorPickerValueSwatch,
  ValueText: ColorPickerValueText,
  View: ColorPickerView,
}

export {
  useColorPicker,
  useColorPickerContext,
  ColorPicker,
  parseColor,
  type ColorPickerRootProps,
  type ColorPickerRootProviderProps,
  type ColorPickerAreaProps,
  type ColorPickerAreaBackgroundProps,
  type ColorPickerAreaThumbProps,
  type ColorPickerChannelInputProps,
  type ColorPickerChannelSliderProps,
  type ColorPickerChannelSliderLabelProps,
  type ColorPickerChannelSliderThumbProps,
  type ColorPickerChannelSliderTrackProps,
  type ColorPickerChannelSliderValueTextProps,
  type ColorPickerContentProps,
  type ColorPickerContextProps,
  type ColorPickerControlProps,
  type ColorPickerEyeDropperTriggerProps,
  type ColorPickerFormatSelectProps,
  type ColorPickerFormatTriggerProps,
  type ColorPickerHiddenInputProps,
  type ColorPickerLabelProps,
  type ColorPickerPortalProps,
  type ColorPickerPositionerProps,
  type ColorPickerSwatchProps,
  type ColorPickerSwatchGroupProps,
  type ColorPickerSwatchIndicatorProps,
  type ColorPickerSwatchTriggerProps,
  type ColorPickerTransparencyGridProps,
  type ColorPickerTriggerProps,
  type ColorPickerValueSwatchProps,
  type ColorPickerValueTextProps,
  type ColorPickerViewProps,
}
