/** Simulate the same media preference for both isolated audit frames.
 * The frames reload when the toggle changes; this does not change OS settings.
 */
export function setAuditMotionPreference(reduced: boolean) {
  document.documentElement.dataset.reducedMotion = String(reduced)
  const matchMedia = window.matchMedia.bind(window)
  window.matchMedia = (query) => {
    const media = matchMedia(query)
    if (query !== "(prefers-reduced-motion: reduce)" && query !== "(prefers-reduced-motion: no-preference)") {
      return media
    }
    return new Proxy(media, {
      get(target, key) {
        if (key === "matches") return query === "(prefers-reduced-motion: reduce)" ? reduced : !reduced
        const value = Reflect.get(target, key, target)
        return typeof value === "function" ? value.bind(target) : value
      },
    })
  }
}
