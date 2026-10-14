## Collapsible

Compose Root, Trigger, and Content. Trigger accepts the native Button variants and wraps plain text labels.
Add Indicator inside Trigger for a chevron. Use `open` / `defaultOpen` and `onOpenChange({ open })`.
Root `disabled` disables the trigger; its expanded state is announced through native accessibility.

Content lazily mounts and unmounts on exit by default. Set `unmountOnExit={false}` to preserve local form state
while hidden; set `lazyMount={false}` too for immediate mounting. Hidden content leaves layout and the
accessibility tree. This port opens immediately without a height animation or a DOM HiddenInput.
