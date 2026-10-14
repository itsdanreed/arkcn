import * as React from "react"

/**
 * Undo/redo state for any immutable value. `set` records a history entry
 * unless `{ commit: false }` is passed (live drags, typing); `checkpoint`
 * snapshots the present before such a sequence so one undo restores it.
 */
export function useHistory<T>(initial: T | (() => T), limit = 100) {
  const [state, setState] = React.useState(() => ({
    past: [] as T[],
    present: typeof initial === "function" ? (initial as () => T)() : initial,
    future: [] as T[],
  }))
  const set = React.useCallback(
    (update: T | ((prev: T) => T), options?: { commit?: boolean }) =>
      setState((s) => {
        const next = typeof update === "function" ? (update as (prev: T) => T)(s.present) : update
        if (Object.is(next, s.present)) return s
        if (options?.commit === false) return { ...s, present: next }
        return { past: [...s.past.slice(-(limit - 1)), s.present], present: next, future: [] }
      }),
    [limit]
  )
  const checkpoint = React.useCallback(
    () => setState((s) => ({ past: [...s.past.slice(-(limit - 1)), s.present], present: s.present, future: [] })),
    [limit]
  )
  const undo = React.useCallback(
    () =>
      setState((s) =>
        s.past.length
          ? { past: s.past.slice(0, -1), present: s.past[s.past.length - 1], future: [s.present, ...s.future] }
          : s
      ),
    []
  )
  const redo = React.useCallback(
    () =>
      setState((s) =>
        s.future.length ? { past: [...s.past, s.present], present: s.future[0], future: s.future.slice(1) } : s
      ),
    []
  )
  const reset = React.useCallback((value: T) => setState({ past: [], present: value, future: [] }), [])
  return {
    present: state.present,
    set,
    checkpoint,
    undo,
    redo,
    reset,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  }
}
