## How it works

One document-level keydown listener behind `HotkeysProvider`, with a registry every component can add to. `useHotkey(hotkey, handler, options)` registers a shortcut for the component's lifetime. Chords like `mod+k` resolve `mod` to Cmd on Mac and Ctrl elsewhere; sequences like `g d` accept the keys one after another within a second. Typing in inputs is ignored unless the hotkey sets `allowInInput`. Labelled hotkeys appear in the cheat sheet, grouped by `group`, and `?` toggles the sheet by default (`dialogHotkey` changes or disables that).

## Parts

`HotkeysDialog` is the cheat sheet on the Dialog component; `useHotkeysDialog()` opens it from a menu item. `HotkeyKbd hotkey=` renders a shortcut as key caps, platform-aware, with "then" between sequence steps. `useHotkeys()` returns the grouped list for a custom rendering, and `formatHotkey` and `parseHotkey` are exported for the rare custom case.

## Notes

- Register page-level shortcuts in the page component with a `group`; they disappear when the page unmounts.
- Hotkeys never fire while the event's default was already prevented, so a component that handles a key itself wins.
