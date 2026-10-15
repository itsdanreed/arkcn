/** Clamp overscroll and preserve proportional thumbs as content and viewport resize. */
export function scrollGeometry(viewport: number, content: number, offset: number, corner = 0) {
  const track = Math.max(0, viewport - corner - 2)
  const maxOffset = Math.max(0, content - viewport)
  const overflow = viewport > 0 && maxOffset > 0
  const thumbSize = overflow ? Math.min(track, Math.max(18, (track * viewport) / content)) : track
  const travel = Math.max(0, track - thumbSize)
  const thumbOffset = maxOffset > 0 ? (Math.max(0, Math.min(maxOffset, offset)) / maxOffset) * travel : 0
  return { overflow, maxOffset, thumbSize, travel, thumbOffset }
}
