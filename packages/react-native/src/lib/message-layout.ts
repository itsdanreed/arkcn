import { Children, Fragment, createContext, createElement, isValidElement, type ReactNode } from "react"
import { Text, type StyleProp, type TextStyle } from "react-native"

export const MessageLayout = createContext({ align: "start" as "start" | "end", footer: false, ghost: false })
/** Inspect composition without rendering arbitrary user components. */
export function hasMessagePart(
  children: ReactNode,
  match: (child: React.ReactElement<Record<string, unknown>>) => boolean
): boolean {
  return Children.toArray(children).some(
    (child) =>
      isValidElement<Record<string, unknown>>(child) &&
      (match(child) || hasMessagePart(child.props.children as ReactNode, match))
  )
}
/** Native Views cannot contain bare strings; explicit Text children retain their own styles. */
export function messageText(children: ReactNode, style: StyleProp<TextStyle>): ReactNode {
  const nodes = Children.toArray(children)
  if (nodes.every((child) => typeof child === "string" || typeof child === "number"))
    return createElement(Text, { style }, children)
  return nodes.map((child, index) => {
    if (typeof child === "string" || typeof child === "number") return createElement(Text, { key: index, style }, child)
    if (isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment)
      return createElement(Fragment, { key: child.key ?? index }, messageText(child.props.children, style))
    return child
  })
}
