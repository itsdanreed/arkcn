export const GestureHandlerRootView = "GestureHandlerRootView"
export const GestureDetector = "GestureDetector"
export const Gesture = {
  Pan: () => {
    const gesture = { config: {}, handlers: {} }
    for (const option of ["minDistance", "maxPointers", "shouldCancelWhenOutside", "cancelsTouchesInView"])
      gesture[option] = (value) => {
        gesture.config[option] = value
        return gesture
      }
    for (const event of ["onStart", "onUpdate", "onEnd", "onFinalize"])
      gesture[event] = (handler) => {
        gesture.handlers[event] = handler
        return gesture
      }
    return gesture
  },
}
