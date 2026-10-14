import { createContext, useContext } from "react"

/** Contexts for compound native components fail clearly outside their root. */
export function createRequiredContext<T>(name: string) {
  const Context = createContext<T | null>(null)
  function useRequiredContext() {
    const value = useContext(Context)
    if (value === null) throw new Error(`${name} parts must be inside ${name}.Root`)
    return value
  }
  return [Context.Provider, useRequiredContext] as const
}
