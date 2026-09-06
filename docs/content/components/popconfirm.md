## How it works

An inline confirmation on the Popover, for destructive actions that do not deserve a modal. The content is `role="alertdialog"`, has an arrow by default, and opens from `PopconfirmTrigger`. `PopconfirmHeader` holds `PopconfirmIcon` (a warning triangle by default), `PopconfirmTitle`, and `PopconfirmDescription`. `PopconfirmFooter` holds `PopconfirmCancelTrigger`, which closes, and `PopconfirmConfirmTrigger`, which calls `onConfirm`, is destructive by default, and closes unless the handler calls `preventDefault` on the event.
