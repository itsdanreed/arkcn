## Tabs

Set an initial `defaultValue` or controlled `value` on Root; each Trigger and Content pair shares a unique
`value`. Changes call `onValueChange({ value })`. Wrap triggers in List, which supports `default` and `line`
variants. Root supports horizontal and vertical orientation. Disable individual triggers with `disabled`.

Panels mount when first selected and unmount when hidden. Set `unmountOnExit={false}` to preserve form state;
set `lazyMount={false}` as well to mount every panel initially. Hidden panels leave layout and accessibility.
Put strings in native Text components inside Content. Trigger wraps its plain text automatically.

These are press-driven content tabs, not screen navigation. This port does not implement Ark's DOM keyboard
roving focus, RootProvider, Context render props, or animated Indicator.
