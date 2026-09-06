## How it works

Comments with replies, reactions, editing, and a composer that understands mentions. `CommentThread` takes the `people` who can be mentioned and the `currentUserId`, and owns only which comment is being replied to or edited (`replyTo`, controllable; `editing` through `useCommentThread()`). Comments, posting, deleting, and reactions are yours.

Mentions are plain `@Full Name` text in the stored value. `CommentBody text=` highlights them, marking the current user's with `data-self`, and `extractMentions(text, people)` returns the ids when you post.

## Parts

`CommentList` holds `Comment value= authorId=` items, each with `CommentAvatar` (initials from `people`) and `CommentContent`: a `CommentHeader` (`CommentAuthor`, `CommentTime date=`, `CommentMeta`), the `CommentBody`, `CommentReactions` of `CommentReaction emoji= count= active=` chips, hover-revealed `CommentActions` with `CommentReplyTrigger` and `CommentEditTrigger`, and `CommentReplies` for a nested list with a guide line. `CommentEmpty` covers the empty state.

## Composer

`CommentComposer` takes `people`, a controllable `value`, `onSubmit({ text, mentions })`, and `onCancel`. `CommentComposerInput` is a contenteditable, not a textarea: picked mentions become grey chips that one Backspace removes, while the value stays plain text. Typing `@` opens `CommentComposerMentionList`, a popover anchored to the input; arrows, Enter, and Tab pick, Escape closes, Cmd or Ctrl+Enter submits. `CommentComposerReplyingTo`, `CommentComposerFooter`, `CommentComposerHint`, `CommentComposerCancelTrigger`, and `CommentComposerSubmitTrigger` finish it. The same composer edits a comment in place with `defaultValue`.
