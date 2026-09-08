## How it works

A command menu on Ark UI's Listbox: an input filters a collection, groups keep their headings, arrow keys move the highlight, and Enter selects. Build the collection with `createListCollection` or `useListCollection` (which also gives you a `filter` function) and pass it to `Command.Root`. `onSelect` receives the selected value.

## Parts

`Command.Input` is the search field. `Command.Content` scrolls the results and holds `Command.Empty`, `CommandGroup heading=` sections of `CommandItem item=` rows with `Command.ItemText`, `Command.ItemIndicator`, and `Command.Shortcut`, and `Command.Separator`. `Command.Dialog` wraps the whole thing in a dialog for a Cmd+K palette; the app shell's search uses it.

## Notes

- `useFilter({ sensitivity: "base" })` from Ark gives a locale-aware `contains` matcher for the collection.
- Items are data; pass the collection item, not a value string.
