# Native conventions

Native components use the same compositional names where they make sense: `Card.Root`, `Card.Title`, `Input.Root`,
and standalone `Button`. Their props are React Native props: `onPress`, `onChangeText`, `style`, and accessibility
attributes. DOM `asChild`, CSS classes, selectors, and keyboard events do not carry across renderers.

Put strings inside native Text components. Button wraps a string or number label automatically; Card.Title,
Card.Description, and Badge.Root already render Text. Label icon-only buttons and inputs explicitly.

Use minHeight and padding so larger text can grow. Expose disabled and loading states to assistive technology.
Place error explanations next to invalid inputs and provide appropriate accessible hints.

Shared business logic belongs in `core`. React hooks that do not touch the DOM belong in `react-shared`.
Native gestures, focus behavior, keyboard handling, and accessibility belong in the native renderer.

## Selection and disclosure

Checkbox and Switch compose `Root`, `Control`, and `Label`; the default Control includes its Indicator or Thumb.
Use `checked` / `defaultChecked` and `onCheckedChange({ checked })`. Checkbox also accepts `"indeterminate"`.
RadioGroup takes `value` / `defaultValue` and `onValueChange({ value })`; each Item has a unique `value`.
A text Item includes its radio control automatically. For custom content, compose ItemControl and ItemText.
Labels are part of the press target. Controls expose checked/selected/expanded and disabled state to native
accessibility services. Use `accessibilityLabel` for controls without visible labels. A readOnly control keeps
its state; invalid fields need an accessible error explanation from the caller.

Tabs use `value` / `defaultValue` and `onValueChange({ value })`. Set the initial value explicitly. List supports
`default` and `line` variants. These are press-driven content tabs, not a navigation router or a DOM keyboard
roving-focus implementation. Collapsible uses `open` / `defaultOpen` and `onOpenChange({ open })`.
Both lazily mount content and unmount it on exit by default. Set `unmountOnExit={false}` to keep form state when
hidden; hidden panels leave layout and the accessibility tree.

## Feedback and images

Progress currently ports the determinate bar parts (Root, Label, ValueText, Track, Range). Values are clamped to
`min`/`max`; circular and indeterminate progress are not yet ported. Use Spinner for an unknown-duration task.
Alert supports default/destructive messages and an optional Action. Its Description and Title render Text.
Avatar has Root, Image, and Fallback. Image accepts React Native `source` (including local assets); fallback
remains visible during loading and on failure. Label the Root when the image conveys identity. Avatar groups
and badges are not yet ported.

Native ports expose only the parts listed in their native API tables. DOM HiddenInput, Ark RootProvider, and
Motion uses Reanimated CSS animations and transitions with shared timing tokens. DOM animation classes do not apply to native components.
