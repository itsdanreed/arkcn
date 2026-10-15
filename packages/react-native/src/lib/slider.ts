/** Shared slider arithmetic. Thumb centers stay six pixels inside the track ends. */
export function snapSliderValue(value: number, min: number, max: number, step: number) {
  const snapped = min + Math.round((value - min) / step) * step
  return Math.min(max, Math.max(min, Number(snapped.toFixed(10))))
}
export function sliderCenter(value: number, min: number, max: number, size: number, reverse = false) {
  const fraction = (value - min) / (max - min)
  return Math.min(6, size / 2) + Math.max(0, size - 12) * (reverse ? 1 - fraction : fraction)
}
export function sliderValueAt(point: number, size: number, min: number, max: number, step: number, reverse = false) {
  let fraction = Math.min(1, Math.max(0, (point - 6) / Math.max(1, size - 12)))
  if (reverse) fraction = 1 - fraction
  return snapSliderValue(min + fraction * (max - min), min, max, step)
}
