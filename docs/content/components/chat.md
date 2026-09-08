## How it works

A layout for messaging: a sidebar with search and a conversation list, a panel with header, messages, and composer, and an empty state. `Chat.Root` owns only the selected conversation (`value`, controllable) and the mobile list-versus-panel state; data, filtering, grouping, and sending are yours.

Messages render newest first inside a reversed column, so the stream stays pinned to the bottom without scroll management.

## Parts

Sidebar: `Chat.Sidebar` with `Chat.SidebarHeader` (`Chat.SidebarTitle`, `Chat.SidebarHeading`, `Chat.Search`) and `Chat.ConversationList` of `ChatConversationItem value=` rows with `Chat.ConversationInfo`, `Chat.ConversationName`, and `Chat.ConversationPreview`.

Panel: `Chat.Panel` with `Chat.Header` (`Chat.BackTrigger` for mobile, `Chat.HeaderInfo`, `Chat.HeaderText`, `Chat.HeaderTitle`, `Chat.HeaderDescription`, `Chat.HeaderActions`), `Chat.Body` with `Chat.Messages` of `ChatMessage variant="sent" | "received"` and `Chat.MessageTime`, `Chat.DateSeparator`, and `Chat.Composer` (a form; handle `onSubmit` and prevent its default) with `Chat.ComposerField`, `Chat.ComposerActions`, `Chat.ComposerInput`, and `Chat.ComposerSendTrigger`. `Chat.Empty` with its icon, title, and description shows when nothing is selected.
