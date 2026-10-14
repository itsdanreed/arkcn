## Button Group

Root joins its direct children horizontally by default; `orientation="vertical"` stacks them. Compose existing Button
parts, static Text segments, and Separator. A separator defaults to vertical; use horizontal separators in a vertical group.
The outside corners remain rounded and shared borders appear only once. Button backgrounds follow the joined corners,
including while pressed; keyboard focus rises above adjacent controls.

Root preserves child refs and events and merges the joined styles with their own styles. Custom child components must
forward `style`; use direct children for edge styling. Selection remains application state, as in the web component.
For an interactive set of choices with built-in selection, use Toggle Group.
