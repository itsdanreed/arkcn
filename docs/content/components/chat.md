## How it works

A layout for messaging: a sidebar with search and a conversation list, a panel with header, messages, and composer, and an empty state. `Chat` owns only the selected conversation (`value`, controllable) and the mobile list-versus-panel state; data, filtering, grouping, and sending are yours.

Messages render newest first inside a reversed column, so the stream stays pinned to the bottom without scroll management.

## Parts

Sidebar: `ChatSidebar` with `ChatSidebarHeader` (`ChatSidebarTitle`, `ChatSidebarHeading`, `ChatSearch`) and `ChatConversationList` of `ChatConversationItem value=` rows with `ChatConversationInfo`, `ChatConversationName`, and `ChatConversationPreview`.

Panel: `ChatPanel` with `ChatHeader` (`ChatBackTrigger` for mobile, `ChatHeaderInfo`, `ChatHeaderText`, `ChatHeaderTitle`, `ChatHeaderDescription`, `ChatHeaderActions`), `ChatBody` with `ChatMessages` of `ChatMessage variant="sent" | "received"` and `ChatMessageTime`, `ChatDateSeparator`, and `ChatComposer` (a form; handle `onSubmit` and prevent its default) with `ChatComposerField`, `ChatComposerActions`, `ChatComposerInput`, and `ChatComposerSendTrigger`. `ChatEmpty` with its icon, title, and description shows when nothing is selected.
