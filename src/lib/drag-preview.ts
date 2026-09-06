import { preserveOffsetOnSource } from "@atlaskit/pragmatic-drag-and-drop/utils/preserve-offset-on-source"
import { setCustomNativeDragPreview } from "@atlaskit/pragmatic-drag-and-drop/utils/set-custom-native-drag-preview"
import type { ElementEventBasePayload } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"

type GeneratePreviewArgs = ElementEventBasePayload & {
  nativeSetDragImage: ((image: Element, x: number, y: number) => void) | null
}

/**
 * Render a crisp clone of the dragged element as the native drag preview,
 * keeping the pointer at the same offset it had on the source. Use from a
 * draggable's `onGenerateDragPreview`.
 */
export function cloneDragPreview(
  { source, location, nativeSetDragImage }: GeneratePreviewArgs,
  options: { className?: string; element?: HTMLElement } = {}
) {
  const element = options.element ?? source.element
  const rect = element.getBoundingClientRect()
  setCustomNativeDragPreview({
    nativeSetDragImage,
    getOffset: preserveOffsetOnSource({ element, input: location.current.input }),
    render({ container }) {
      const clone = element.cloneNode(true) as HTMLElement
      clone.removeAttribute("data-dragging")
      clone.removeAttribute("data-grabbed")
      clone.style.width = `${rect.width}px`
      clone.style.height = `${rect.height}px`
      clone.style.boxSizing = "border-box"
      clone.style.pointerEvents = "none"
      clone.classList.add("shadow-xl", "rotate-1", "opacity-95")
      if (options.className) clone.classList.add(...options.className.split(" ").filter(Boolean))
      container.appendChild(clone)
      return () => {
        container.removeChild(clone)
      }
    },
  })
}
