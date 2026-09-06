import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectControl,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createListCollection } from "@ark-ui/react/collection"
import { RadioGroup, RadioGroupItemHiddenInput } from "@/components/ui/radio-group"
import { RadioGroup as RadioGroupPrimitive } from "@ark-ui/react"
import { cn } from "@/lib/utils"
import { showSubmittedData } from "@/demo/lib/show-submitted-data"
import { useForm } from "@/lib/form"

const fonts = ["inter", "manrope", "system"] as const
const fontCollection = createListCollection({
  items: fonts.map((f) => ({ value: f, label: f })),
  itemToValue: (o) => o.value,
})

type AppearanceFormValues = {
  theme: "light" | "dark"
  font: (typeof fonts)[number]
}

function ThemePreview({ variant }: { variant: "light" | "dark" }) {
  const light = variant === "light"
  const bg = light ? "bg-[#ecedef]" : "bg-slate-950"
  const card = light ? "bg-white" : "bg-slate-800"
  const bar = light ? "bg-[#ecedef]" : "bg-slate-400"
  return (
    <div
      className={cn(
        "items-center rounded-md border-2 border-muted p-1",
        light ? "hover:border-accent" : "bg-popover hover:bg-accent hover:text-accent-foreground"
      )}
    >
      <div className={cn("space-y-2 rounded-sm p-2", bg)}>
        <div className={cn("space-y-2 rounded-md p-2 shadow-xs", card)}>
          <div className={cn("h-2 w-20 rounded-lg", bar)} />
          <div className={cn("h-2 w-25 rounded-lg", bar)} />
        </div>
        <div className={cn("flex items-center space-x-2 rounded-md p-2 shadow-xs", card)}>
          <div className={cn("size-4 rounded-full", bar)} />
          <div className={cn("h-2 w-25 rounded-lg", bar)} />
        </div>
        <div className={cn("flex items-center space-x-2 rounded-md p-2 shadow-xs", card)}>
          <div className={cn("size-4 rounded-full", bar)} />
          <div className={cn("h-2 w-25 rounded-lg", bar)} />
        </div>
      </div>
    </div>
  )
}

export function AppearanceForm() {
  const { resolvedTheme, setTheme } = useTheme()
  const { values, errors, setValue, handleSubmit } = useForm<AppearanceFormValues>(
    { theme: resolvedTheme === "dark" ? "dark" : "light", font: "inter" },
    () => ({}),
    (data) => {
      if (data.theme !== resolvedTheme) setTheme(data.theme)
      showSubmittedData(data)
    }
  )

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="gap-8">
        <Field>
          <FieldLabel htmlFor="appearance-font">Font</FieldLabel>
          <Select
            ids={{ trigger: "appearance-font" }}
            collection={fontCollection}
            value={[values.font]}
            onValueChange={({ value }) => value[0] && setValue("font", value[0] as AppearanceFormValues["font"])}
          >
            <SelectControl>
              <SelectTrigger className="w-50 capitalize">
                <SelectValue>{values.font}</SelectValue>
              </SelectTrigger>
            </SelectControl>
            <SelectContent>
              {fonts.map((font) => (
                <SelectItem key={font} item={{ value: font, label: font }} className="capitalize">
                  <SelectItemText>{font}</SelectItemText>
                  <SelectItemIndicator />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>Set the font you want to use in the dashboard.</FieldDescription>
          <FieldError>{errors.font}</FieldError>
        </Field>

        <Field>
          <FieldLabel>Theme</FieldLabel>
          <FieldDescription>Select the theme for the dashboard.</FieldDescription>
          <FieldError>{errors.theme}</FieldError>
          <RadioGroup
            value={values.theme}
            onValueChange={({ value }) => setValue("theme", value as AppearanceFormValues["theme"])}
            className="grid max-w-md grid-cols-2 gap-8 pt-2"
          >
            {(["light", "dark"] as const).map((option) => (
              <RadioGroupPrimitive.Item
                key={option}
                value={option}
                data-theme-option={option}
                className="group/theme-option cursor-pointer outline-none [&>div]:rounded-md data-focus-visible:[&>div]:ring-3 data-focus-visible:[&>div]:ring-ring/50 data-checked:[&>div]:border-primary"
              >
                <ThemePreview variant={option} />
                <RadioGroupPrimitive.ItemText className="block w-full p-2 text-center font-normal capitalize">
                  {option}
                </RadioGroupPrimitive.ItemText>
                <RadioGroupItemHiddenInput />
              </RadioGroupPrimitive.Item>
            ))}
          </RadioGroup>
        </Field>

        <div>
          <Button type="submit">Update preferences</Button>
        </div>
      </FieldGroup>
    </form>
  )
}
