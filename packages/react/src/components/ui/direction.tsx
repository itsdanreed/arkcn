"use client"

import * as React from "react"

type Direction = "ltr" | "rtl"

/**
 * Ark UI has no global direction provider; each Ark component accepts a `dir`
 * prop and its `LocaleProvider` derives direction from a locale. This mirrors
 * Radix's `DirectionProvider`: a plain React context you can read with
 * `useDirection` and forward to Ark components as `dir`.
 */
const DirectionContext = React.createContext<Direction | undefined>(undefined)

function DirectionRoot({ dir, direction, children }: DirectionRootProps) {
  return <DirectionContext.Provider value={direction ?? dir}>{children}</DirectionContext.Provider>
}

function useDirection(localDir?: Direction): Direction {
  const globalDir = React.useContext(DirectionContext)
  return localDir ?? globalDir ?? "ltr"
}

type DirectionRootProps = {
  /** Text direction, `ltr` or `rtl`. */
  dir?: Direction
  /** Alias of `dir`. */
  direction?: Direction
  children?: React.ReactNode
}

const Direction = {
  Root: DirectionRoot,
}

export { useDirection, Direction, type DirectionRootProps }
