## How it works

An inline confirmation on the Popover, for destructive actions that do not deserve a modal. The content is `role="alertdialog"`, has an arrow by default, and opens from `Popconfirm.Trigger`. `Popconfirm.Header` holds `Popconfirm.Icon` (a warning triangle by default), `Popconfirm.Title`, and `Popconfirm.Description`. `Popconfirm.Footer` holds `Popconfirm.CancelTrigger`, which closes, and `Popconfirm.ConfirmTrigger`, which calls `onConfirm`, is destructive by default, and closes unless the handler calls `preventDefault` on the event.
