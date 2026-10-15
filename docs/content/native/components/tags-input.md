## How it works

`TagsInput.Root` manages tags and the entry draft independently. Use `defaultValue` / `defaultInputValue` for uncontrolled state, or `value` / `inputValue` with their change callbacks for controlled state. `useTagsInput` and `RootProvider` support external composition. `Context` exposes the current values, focus, add/remove/clear methods, and edit state.

Return adds a tag. Typing the delimiter (comma by default) commits completed tags. Empty input ignores Return; Backspace on empty input highlights the last tag, and a second Backspace removes it. Tags trim whitespace and reject duplicates by default. Configure `sanitizeValue`, `allowDuplicates`, `max`, and `validate`; rejected entries call `onValueInvalid` and stay available for correction. `blurBehavior` optionally adds or clears the draft.

With `addOnPaste`, a multi-character text insertion containing delimiters adds all entries. React Native does not expose a portable paste event, so this also applies to delimiter-separated keyboard suggestions or autofill. Normal typing leaves the unfinished last entry in the input.

Compose `ItemPreview`, `ItemText`, `ItemDeleteTrigger`, and `ItemInput` inside each `Item`. Hold a tag's text to edit it; Return or blur commits the edit. Empty edits remove the tag; Escape cancels with a hardware keyboard. Set `editable={false}` when not rendering `ItemInput`. `disabled` and `readOnly` block all mutations; Fieldset disabling is inherited. Label focuses the input and supplies its accessibility label; removal buttons name the affected tag.

The control uses the audited web dimensions, chip typography, shared light/dark tokens, validation rings, and reduced-motion-aware color transitions. Long tags truncate to the available width and have their complete value in the delete button's accessibility label. Native forms consume `onValueChange`; there is no hidden HTML input.
