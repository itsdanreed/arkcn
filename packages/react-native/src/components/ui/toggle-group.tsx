/** Single or multiple selection with spaced or joined controls. */
import { Children, createContext, useContext, type ComponentPropsWithRef, type ReactNode } from "react"
import { StyleSheet, View } from "react-native"
import { useControllable } from "../../lib/controllable"
import { createRequiredContext } from "../../lib/context"
import { Toggle, type ToggleRootProps } from "./toggle"

export type UseToggleGroupProps = {
  /** Controlled selected item values. */
  value?: string[]
  /** Initial uncontrolled selection. */
  defaultValue?: string[]
  /** Receives the next selection. */
  onValueChange?: (details: { value: string[] }) => void
  /** Allows several items to be selected. */
  multiple?: boolean
  /** Allows a selected item to be deselected. */
  deselectable?: boolean
  /** Disables every item. */
  disabled?: boolean
}
export function useToggleGroup({
  value,
  defaultValue = [],
  onValueChange,
  multiple = false,
  deselectable = true,
  disabled = false,
}: UseToggleGroupProps = {}) {
  const [selected, setValue] = useControllable(value, defaultValue, (value) => onValueChange?.({ value }))
  return {
    value: selected,
    setValue,
    disabled,
    multiple,
    deselectable,
    toggleValue(item: string) {
      if (disabled) return
      const active = selected.includes(item)
      if (active && !multiple && !deselectable) return
      setValue(active ? selected.filter((value) => value !== item) : multiple ? [...selected, item] : [item])
    },
  }
}
export type UseToggleGroupReturn = ReturnType<typeof useToggleGroup>
const [Provider, useToggleGroupContext] = createRequiredContext<UseToggleGroupReturn>("ToggleGroup")
export { useToggleGroupContext }
type Appearance = {
  /** Surface treatment inherited by items. */
  variant?: ToggleRootProps["variant"]
  /** Visible size inherited by items. */
  size?: ToggleRootProps["size"]
  /** Gap in four-pixel spacing units; zero joins the items. */
  spacing?: number
  /** Direction of the item layout. */
  orientation?: "horizontal" | "vertical"
}
const AppearanceContext = createContext<Appearance>({})
const PositionContext = createContext({ first: true, last: true })
export type ToggleGroupRootProviderProps = Omit<ComponentPropsWithRef<typeof View>, "children"> &
  Appearance & {
    /** State created by useToggleGroup. */
    value: UseToggleGroupReturn
    /** Composed group items. */
    children?: ReactNode
  }
function ToggleGroupRootProvider({
  value,
  variant,
  size,
  spacing = 2,
  orientation = "horizontal",
  children,
  style,
  ...props
}: ToggleGroupRootProviderProps) {
  const items = Children.toArray(children)
  return (
    <Provider value={value}>
      <AppearanceContext.Provider value={{ variant, size, spacing, orientation }}>
        <View
          accessibilityRole={value.multiple ? undefined : "radiogroup"}
          {...props}
          style={[
            {
              alignSelf: "flex-start",
              flexDirection: orientation === "horizontal" ? "row" : "column",
              alignItems: orientation === "horizontal" ? "center" : "stretch",
              gap: spacing * 4,
              borderRadius: size === "sm" ? 8 : 10,
            },
            style,
          ]}
        >
          {items.map((child, index) => (
            <PositionContext.Provider
              key={typeof child === "object" && "key" in child ? child.key : index}
              value={{ first: index === 0, last: index === items.length - 1 }}
            >
              {child}
            </PositionContext.Provider>
          ))}
        </View>
      </AppearanceContext.Provider>
    </Provider>
  )
}
export type ToggleGroupRootProps = ComponentPropsWithRef<typeof View> & Appearance & UseToggleGroupProps
function ToggleGroupRoot({
  value,
  defaultValue,
  onValueChange,
  multiple,
  deselectable,
  disabled,
  ...props
}: ToggleGroupRootProps) {
  const state = useToggleGroup({ value, defaultValue, onValueChange, multiple, deselectable, disabled })
  return <ToggleGroupRootProvider {...props} value={state} />
}
export type ToggleGroupItemProps = Omit<ToggleRootProps, "pressed" | "defaultPressed" | "onPressedChange"> & {
  /** Unique selection value. */
  value: string
}
function ToggleGroupItem({ value, disabled, variant, size, style, ...props }: ToggleGroupItemProps) {
  const state = useToggleGroupContext()
  const appearance = useContext(AppearanceContext)
  const { first, last } = useContext(PositionContext)
  const vertical = appearance.orientation === "vertical"
  const joined = appearance.spacing === 0
  const effectiveVariant = appearance.variant ?? variant
  return (
    <Toggle.Root
      {...props}
      accessibilityRole={state.multiple ? "button" : "radio"}
      disabled={disabled || state.disabled}
      variant={effectiveVariant}
      size={appearance.size ?? size}
      pressed={state.value.includes(value)}
      onPressedChange={() => state.toggleValue(value)}
      style={(pressState) => [
        joined && {
          paddingHorizontal: 8,
          borderRadius: 0,
          borderTopLeftRadius: first ? 10 : 0,
          borderBottomRightRadius: last ? 10 : 0,
          borderTopRightRadius: (vertical ? first : last) ? 10 : 0,
          borderBottomLeftRadius: (vertical ? last : first) ? 10 : 0,
          ...(effectiveVariant === "outline" && !first
            ? vertical
              ? { borderTopWidth: 0 }
              : { borderLeftWidth: 0 }
            : {}),
        },
        StyleSheet.flatten(typeof style === "function" ? style(pressState) : style),
      ]}
    />
  )
}
export type ToggleGroupContextProps = {
  /** Receives selection state. */ children: (state: UseToggleGroupReturn) => ReactNode
}
function ToggleGroupContext({ children }: ToggleGroupContextProps) {
  return children(useToggleGroupContext())
}

export const ToggleGroup = {
  Root: ToggleGroupRoot,
  RootProvider: ToggleGroupRootProvider,
  Item: ToggleGroupItem,
  Context: ToggleGroupContext,
}
