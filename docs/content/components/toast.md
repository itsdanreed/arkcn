# Toast

Create a store with createToaster and pass it to Toast.Toaster. Its render callback receives each notification's title, description, type, and action. Compose Toast.Root, Title, Description, ActionTrigger, and CloseTrigger inside that callback.

Use the store to create, update, dismiss, and manage notifications. The duration controls automatic dismissal; an action can offer Undo or another response. The notification root retains Ark's live-region semantics and supports a custom element through asChild.

The group renderer owns its list and receives a render callback, so it has no replacement-child API. Toast.Root is the polymorphic boundary for each notification. Sonner remains available as a separate integration.
