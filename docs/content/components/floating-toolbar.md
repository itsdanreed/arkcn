## How it works

The snackbar-style bar that floats at the bottom of a page for "N things pending" actions. `open` shows or hides it with a transition, `onEscape` fires when Escape is pressed while a button in it has focus, and arrow keys, Home, and End rove between its buttons. Escape is ignored while focus is inside a nested menu, so a dropdown in the bar closes first.

The data table's bulk actions render on it, and the data grid demo uses it for unsaved changes. Use it wherever you would otherwise add a fixed div.
