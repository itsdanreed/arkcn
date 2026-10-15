## How it works

Message provides `Root`, `Group`, `Avatar`, `Content`, `Header`, and `Footer`. It uses the web component's 14px body text, 12px metadata, 8px message gap, and 10px content gap in both themes. `align="end"` reverses the avatar position and aligns the content and its bubbles to the trailing edge.

Bare strings are wrapped in native Text. Use `textStyle` on Content, Header, or Footer to customize their text. Explicit Text children keep their own styling. All parts accept native View props and merge `style` last.

The avatar moves up 32px when a Footer is present, matching web. A ghost Bubble removes metadata's horizontal inset. Fragments and ordinary child composition are detected; when a custom component hides these parts, set `hasFooter` or `ghost` on Root explicitly.

Use Bubble for message surfaces and reactions. Message does not implement transport, persistence, virtualization, or live announcements; those belong to the conversation screen. Layout responds to native writing direction. Device screen-reader navigation and Android visuals remain unverified.
