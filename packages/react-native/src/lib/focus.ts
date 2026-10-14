import { Platform, type NativeSyntheticEvent, type TargetedEvent } from "react-native"

/** Pointer focus on the web must not show a keyboard focus ring. */
export function isFocusVisible(event: NativeSyntheticEvent<TargetedEvent>) {
  if (Platform.OS !== "web") return true
  const target = event.currentTarget as unknown as { matches?: (selector: string) => boolean }
  return target?.matches?.(":focus-visible") ?? false
}
