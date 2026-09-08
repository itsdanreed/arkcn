# Listbox

Create a collection with createListCollection, or use useListCollection when options can be filtered. Pass it to Listbox.Root and compose Label, Content, and Item parts. Each Item receives its collection item; ItemText and ItemIndicator provide its label and selected state.

Use selectionMode to select one or multiple options. Input can drive filtering, Empty handles no matches, and ValueText displays selected values. ItemGroup and ItemGroupLabel organize options.

Keyboard navigation and selection follow Ark's listbox behavior. RootProvider accepts useListbox's return value and preserves the collection's item type. Command remains a separate composition for command menus.
