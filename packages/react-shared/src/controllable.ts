import * as React from "react"

type Updater<T> = T | ((prev: T) => T)

/**
 * Controlled-or-uncontrolled state. Pass the controlled value (or `undefined`), the
 * uncontrolled default, and an optional change callback that fires in both modes.
 */
export function useControllable<T>(
  controlled: T | undefined,
  defaultValue: T,
  onChange?: (value: T) => void
): [T, (next: Updater<T>) => void] {
  const [internal, setInternal] = React.useState<T>(defaultValue)
  const isControlled = controlled !== undefined
  const value = isControlled ? (controlled as T) : internal
  const valueRef = React.useRef(value)
  valueRef.current = value
  const onChangeRef = React.useRef(onChange)
  onChangeRef.current = onChange
  const set = React.useCallback(
    (updater: Updater<T>) => {
      const next = typeof updater === "function" ? (updater as (prev: T) => T)(valueRef.current) : updater
      if (Object.is(next, valueRef.current)) return
      if (!isControlled) setInternal(next)
      onChangeRef.current?.(next)
    },
    [isControlled]
  )
  return [value, set]
}
