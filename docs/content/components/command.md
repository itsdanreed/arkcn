## How it works

A command menu on Ark UI's Listbox: an input filters a collection, groups keep their headings, arrow keys move the highlight, and Enter selects. Build the collection with `createListCollection` or `useListCollection` (which also gives you a `filter` function) and pass it to `Command`. `onSelect` receives the selected value.

## Parts

`CommandInput` is the search field. `CommandList` scrolls the results and holds `CommandEmpty`, `CommandGroup heading=` sections of `CommandItem item=` rows with `CommandItemText`, `CommandItemIndicator`, and `CommandShortcut`, and `CommandSeparator`. `CommandDialog` wraps the whole thing in a dialog for a Cmd+K palette; the app shell's search uses it.

## Notes

- `useFilter({ sensitivity: "base" })` from Ark gives a locale-aware `contains` matcher for the collection.
- Items are data; pass the collection item, not a value string.
