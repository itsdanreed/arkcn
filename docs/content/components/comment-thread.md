## How it works

Comments with replies, reactions, editing, and a composer that understands mentions. `CommentThread.Root` takes the `people` who can be mentioned and the `currentUserId`, and owns only which comment is being replied to or edited (`replyTo`, controllable; `editing` through `useCommentThread()`). Comments, posting, deleting, and reactions are yours.

Mentions are plain `@Full Name` text in the stored value. `CommentBody text=` highlights them, marking the current user's with `data-self`, and `extractMentions(text, people)` returns the ids when you post.

## Parts

`CommentThread.List` holds `Comment value= authorId=` items, each with `CommentThread.Avatar` (initials from `people`) and `CommentThread.Content`: a `CommentThread.Header` (`CommentThread.Author`, `CommentTime date=`, `CommentThread.Meta`), the `CommentThread.Body`, `CommentThread.Reactions` of `CommentReaction emoji= count= active=` chips, hover-revealed `CommentThread.Actions` with `CommentThread.ReplyTrigger` and `CommentThread.EditTrigger`, and `CommentThread.Replies` for a nested list with a guide line. `CommentThread.Empty` covers the empty state.

## Composer

`CommentThread.Composer` takes `people`, a controllable `value`, `onSubmit({ text, mentions })`, and `onCancel`. `CommentThread.ComposerInput` is a contenteditable, not a textarea: picked mentions become grey chips that one Backspace removes, while the value stays plain text. Typing `@` opens `CommentThread.ComposerMentionList`, a popover anchored to the input; arrows, Enter, and Tab pick, Escape closes, Cmd or Ctrl+Enter submits. `CommentThread.ComposerReplyingTo`, `CommentThread.ComposerFooter`, `CommentThread.ComposerHint`, `CommentThread.ComposerCancelTrigger`, and `CommentThread.ComposerSubmitTrigger` finish it. The same composer edits a comment in place with `defaultValue`.
