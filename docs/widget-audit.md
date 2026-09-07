# Documentation widget audit

Checked on September 7, 2026 in the browser against the local documentation site.

## Coverage

- Visited all 111 documentation URLs: seven guides, the component index, and 103 component pages.
- Loaded all 101 live examples and switched each example from Preview to Code and back, checking that example source was present.
- Exercised controls on 83 interactive example pages, including mouse, keyboard, text entry, selection, scrolling, drag, resize, and a disposable local file upload.
- Checked the shared layout at desktop size and all documentation routes at a 390-pixel viewport. Rechecked the pages affected by shared header overflow and the carousel fix.
- Sidebar and App Shell have documentation but no live example. The 18 remaining examples are displays rather than interactive controls: aspect-ratio, separator, table, kbd, alert, badge, progress, skeleton, spinner, marquee, avatar, format, qr-code, bubble, message, marker, activity-feed, and direction.

## Interaction checks

| Area | Pages and actions exercised |
| --- | --- |
| Layout | Accordion expand/collapse; collapsible reveal; tabs change content; Resizable keyboard adjustment; Scroll Area and Virtual List scrolling; carousel next/previous and boundaries. Resizable required no changes. |
| Form values | Checkbox and label toggles; radio, segment, toggle and toggle-group selection; switch; input, input-group, textarea, field and OTP entry; password reveal/hide; numeric increment/decrement; slider and angle keyboard adjustment; date segments; rating; editable save; tag addition/removal. |
| Pickers | Select choice; combobox filtering/selection; tree-select removal, search and selection; cascader search/selection; transfer selected/all items; color swatch selection and hue adjustment. |
| Overlays | Dialog save, drawer submit/cancel, sheet save, alert-dialog cancel, popover editing, popconfirm confirmation; dropdown radio selection; context-menu selection; menubar keyboard navigation; tooltip focus; hover-card reveal; floating-panel movement, maximize and close; tour next/back/completion. |
| Navigation | Breadcrumb and navigation-menu links; pagination current page and next; steps forward/back/completion; TOC anchors; tree and JSON tree expansion/selection. |
| Data | Data-table filtering; data-grid text editing/commit and select-editor opening; kanban card drag; canvas palette insertion, resize and removal; gantt bar drag and Today; scheduler event move/resize; query rule/group addition, removal and value editing; rich-text entry and bold formatting; node movement, zoom and fit. |
| Communication | Chat send and conversation switching, including mobile Back; comment entry, reaction and reply controls; floating-toolbar actions; live-region announcement text; shortcut dialog; toast and clipboard. |
| Specialty | Signature drawing/clearing; crop handle resizing; chart keyboard tooltip; file chooser upload and removal; timer start/pause/resume/reset; swap toggle. |
| Presentation actions | Button variants accept clicks; button-group selection; card, empty and item action feedback; attachment cancellation/download feedback. Download examples deliberately show integration feedback rather than claiming to download a nonexistent file. |

## Repairs

- Steps and Timer now honor `asChild`, avoiding nested buttons. Registry copies were regenerated.
- Tour's positioner now stacks above its backdrop so tooltip-step buttons receive clicks.
- Command filters its collection and supports an empty result state. Combobox opening no longer clears the user's initial search.
- Color swatches use selectable triggers; hue controls use an HSL color format. The value swatch has rounded square corners.
- Timer starts at five minutes and can resume after pausing; Steps has completion content; Query Builder uses the supported `greaterThan` operator.
- Pagination and Swap now update state. Navigation links and TOC anchors point to real destinations.
- Save/Submit closes the demo overlays. Example actions provide feedback; attachment cancellation removes the pending item; reply mode is visible.
- Node-graph connections use monotonically increasing IDs, avoiding collisions after deletion.
- Changing component routes resets the lazy example and Preview/Code state.
- Mobile header controls fit the viewport; carousel arrows fit the preview; mobile chat includes a Back control.

## Validation

`npm run check`, `npm run docs:build`, and `git diff --check` pass. The production build generates 111 documentation route files. Vite reports its existing large-chunk advisory.

This is an interaction audit of the examples as composed, not exhaustive testing of every exported component prop, assistive technology, or browser engine. The sibling demo repository mentioned in CLAUDE.md is not present, so its separate test suite could not be run.
