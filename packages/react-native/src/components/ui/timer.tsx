/** Countdown and elapsed-time display with native lifecycle handling and the web Timer's controls. */
import { useEffect, useRef, useState, type ComponentPropsWithRef, type ReactNode } from "react"
import { AppState, Platform, Text, View } from "react-native"
import { createRequiredContext } from "../../lib/context"
import { useNativeTheme } from "../../lib/theme"
import { Button, type ButtonProps } from "./button"

export type TimerTime = { days: number; hours: number; minutes: number; seconds: number; milliseconds: number }
export type TimerFormattedTime = { [K in keyof TimerTime]: string }
export type TimerAction = "start" | "pause" | "resume" | "reset" | "restart"
export type TimerTickDetails = { value: number; time: TimerTime; formattedTime: TimerFormattedTime }
export type UseTimerProps = {
  startMs?: number
  targetMs?: number
  countdown?: boolean
  autoStart?: boolean
  interval?: number
  onTick?: (details: TimerTickDetails) => void
  onComplete?: () => void
  translations?: { areaLabel?: (time: TimerTime, formattedTime: TimerFormattedTime) => string }
}
function parts(value: number) {
  const ms = Math.max(0, Math.floor(value))
  const time: TimerTime = {
    days: Math.floor(ms / 86400000),
    hours: Math.floor(ms / 3600000) % 24,
    minutes: Math.floor(ms / 60000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
    milliseconds: ms % 1000,
  }
  const formattedTime = Object.fromEntries(
    Object.entries(time).map(([key, value]) => [key, String(value).padStart(key === "milliseconds" ? 3 : 2, "0")])
  ) as TimerFormattedTime
  return { value, time, formattedTime }
}
type Mode = "idle" | "running" | "paused"
export function useTimer({
  startMs = 0,
  targetMs,
  countdown = false,
  autoStart = false,
  interval = 1000,
  ...options
}: UseTimerProps = {}) {
  if (
    !Number.isFinite(startMs) ||
    startMs < 0 ||
    (targetMs !== undefined && (!Number.isFinite(targetMs) || targetMs < 0))
  )
    throw new RangeError("Timer values must be finite, non-negative milliseconds")
  if (!Number.isFinite(interval) || interval <= 0) throw new RangeError("Timer interval must be positive")
  const target = targetMs ?? (countdown ? 0 : undefined)
  if (target !== undefined && (countdown ? target > startMs : target < startMs))
    throw new RangeError("Timer target must be in the counting direction")
  const [state, setState] = useState({ mode: autoStart ? ("running" as Mode) : ("idle" as Mode), value: startMs })
  const current = useRef({ ...state, base: startMs, since: Date.now() })
  const mounted = useRef(false)
  const latest = useRef({ startMs, target, countdown, interval, ...options })
  latest.current = { startMs, target, countdown, interval, ...options }
  const commit = (mode: Mode, value: number) => {
    current.current.mode = mode
    current.current.value = value
    if (mounted.current) setState({ mode, value })
  }
  const tick = (exact = false) => {
    const c = current.current
    if (!mounted.current || c.mode !== "running") return
    const p = latest.current
    const elapsed = Math.max(0, Date.now() - c.since)
    const delta = exact ? elapsed : Math.floor(elapsed / p.interval) * p.interval
    const measured = c.base + (p.countdown ? -delta : delta)
    // A changed display interval must not move the timer backwards.
    const next = p.countdown ? Math.min(c.value, measured) : Math.max(c.value, measured)
    const reached = p.target !== undefined && (p.countdown ? next <= p.target : next >= p.target)
    const value = reached ? p.target! : Math.max(0, next)
    const changed = value !== c.value
    // Commit before callbacks so completion cannot fire twice or undo a callback's restart.
    commit(reached ? "idle" : "running", value)
    if (changed) p.onTick?.(parts(value))
    if (reached) p.onComplete?.()
  }
  const begin = (value: number) => {
    if (!mounted.current) return
    current.current.base = value
    current.current.since = Date.now()
    commit("running", value)
    tick()
  }
  const start = () => {
    if (current.current.mode === "idle") begin(current.current.value)
  }
  const resume = () => {
    if (current.current.mode === "paused") begin(current.current.value)
  }
  const pause = () => {
    if (!mounted.current || current.current.mode !== "running") return
    tick(true)
    if (current.current.mode === "running") commit("paused", current.current.value)
  }
  const reset = () => {
    if (!mounted.current) return
    if (current.current.mode === "running") begin(latest.current.startMs)
    else commit("idle", latest.current.startMs)
  }
  const restart = () => begin(latest.current.startMs)
  const actions = useRef({ tick, restart })
  actions.current = { tick, restart }
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])
  const previous = useRef({ startMs, target, countdown })
  useEffect(() => {
    const old = previous.current
    previous.current = { startMs, target, countdown }
    if (old.startMs !== startMs || old.target !== target || old.countdown !== countdown) actions.current.restart()
  }, [startMs, target, countdown])
  useEffect(() => {
    if (state.mode !== "running") return
    const update = () => actions.current.tick()
    const id = setInterval(update, interval)
    const subscription = AppState.addEventListener("change", (next) => {
      if (next === "active") update()
    })
    update()
    return () => {
      clearInterval(id)
      subscription.remove()
    }
  }, [state.mode, interval])
  const details = parts(state.value)
  const range = target === undefined ? 0 : Math.abs(startMs - target)
  const progressPercent =
    range === 0
      ? 0
      : Math.min(1, Math.max(0, countdown ? (state.value - target!) / range : (state.value - startMs) / range))
  return {
    ...details,
    running: state.mode === "running",
    paused: state.mode === "paused",
    progressPercent,
    start,
    pause,
    resume,
    reset,
    restart,
    translations: options.translations,
  }
}
export type TimerApi = ReturnType<typeof useTimer>
const [Provider, useTimerContext] = createRequiredContext<TimerApi>("Timer")
export { useTimerContext }
export type TimerRootProps = ComponentPropsWithRef<typeof View> & UseTimerProps
function Root({
  startMs,
  targetMs,
  countdown,
  autoStart,
  interval,
  onTick,
  onComplete,
  translations,
  ...props
}: TimerRootProps) {
  const api = useTimer({ startMs, targetMs, countdown, autoStart, interval, onTick, onComplete, translations })
  return <RootProvider {...props} value={api} />
}
export type TimerRootProviderProps = ComponentPropsWithRef<typeof View> & { value: TimerApi }
function RootProvider({ value, style, ...props }: TimerRootProviderProps) {
  return (
    <Provider value={value}>
      <View {...props} style={[{ alignItems: "center", gap: 12 }, style]} />
    </Provider>
  )
}
export type TimerContextProps = { children: (api: TimerApi) => ReactNode }
function Context({ children }: TimerContextProps) {
  return children(useTimerContext())
}
const mono =
  Platform.OS === "web"
    ? 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
    : Platform.OS === "ios"
      ? "Menlo"
      : "monospace"
const digitStyle = {
  fontFamily: mono,
  fontSize: 24,
  lineHeight: 32,
  fontWeight: "500" as const,
  fontVariant: ["tabular-nums" as const],
  includeFontPadding: false,
}
export type TimerAreaProps = ComponentPropsWithRef<typeof View>
function Area({ style, ...props }: TimerAreaProps) {
  const api = useTimerContext()
  const label =
    api.translations?.areaLabel?.(api.time, api.formattedTime) ??
    `${api.time.days} days ${api.formattedTime.hours}:${api.formattedTime.minutes}:${api.formattedTime.seconds}`
  return (
    <View
      accessible
      role="timer"
      accessibilityLabel={label}
      accessibilityLiveRegion="none"
      {...props}
      style={[{ flexDirection: "row", alignItems: "center", gap: 4 }, style]}
    />
  )
}
export type TimerItemProps = ComponentPropsWithRef<typeof Text> & { type: keyof TimerTime }
function Item({ type, children, style, ...props }: TimerItemProps) {
  const api = useTimerContext()
  const { colors, radius } = useNativeTheme()
  return (
    <Text
      accessible={false}
      {...props}
      style={[
        digitStyle,
        {
          minWidth: 40,
          textAlign: "center",
          borderRadius: radius.lg,
          overflow: "hidden",
          paddingHorizontal: 8,
          paddingVertical: 4,
          backgroundColor: colors.muted,
          color: colors.foreground,
        },
        style,
      ]}
    >
      {children ?? api.formattedTime[type]}
    </Text>
  )
}
export type TimerSeparatorProps = ComponentPropsWithRef<typeof Text>
function Separator({ children, style, ...props }: TimerSeparatorProps) {
  const { colors } = useNativeTheme()
  return (
    <Text
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no"
      {...props}
      style={[digitStyle, { color: colors.mutedForeground }, style]}
    >
      {children ?? ":"}
    </Text>
  )
}
export type TimerControlProps = ComponentPropsWithRef<typeof View>
function Control({ style, ...props }: TimerControlProps) {
  return <View {...props} style={[{ flexDirection: "row", alignItems: "center", gap: 8 }, style]} />
}
export type TimerActionTriggerProps = ButtonProps & { action: TimerAction }
function ActionTrigger({ action, children, onPress, ...props }: TimerActionTriggerProps) {
  const api = useTimerContext()
  const hidden =
    action === "start"
      ? api.running || api.paused
      : action === "pause"
        ? !api.running
        : action === "resume"
          ? !api.paused
          : action === "reset"
            ? !api.running && !api.paused
            : false
  if (hidden) return null
  return (
    <Button
      variant="outline"
      size="sm"
      {...props}
      onPress={(event) => {
        onPress?.(event)
        if (!event.defaultPrevented) api[action]()
      }}
    >
      {children ?? action[0].toUpperCase() + action.slice(1)}
    </Button>
  )
}
export const Timer = { Root, RootProvider, Context, Area, Item, Separator, Control, ActionTrigger }
