## How it works

Table renders native Views, Text, and a horizontal ScrollView using the audited web typography, spacing, row dividers, footer tint, and selected/expanded states. It supplies Root, Header, Body, Footer, Row, Head, Cell, and Caption.

Text columns are measured across headers, body rows, and footers, then share the available width proportionally. Removing a row removes its measurements from sizing. Captions render below the table even when declared first. colSpan joins adjacent columns for totals and empty states.

Use Root's columnWidths for fixed logical-pixel widths, especially when cells contain custom components. Otherwise plain text is measured; custom components without textual children cannot provide intrinsic widths. minWidth keeps the table readable on smaller screens by allowing horizontal scrolling. scrollViewProps exposes native scrolling callbacks and its ref.

Use Cell/Head align="end" for amounts, textStyle for text overrides, and checkbox to remove trailing padding from a checkbox cell. Nested arkcn controls keep their own styling and behavior. selected and expanded on Row control its background; row selection remains consumer-owned.

This is the small compositional Table, not Data Table or Data Grid. It does not provide sorting, virtualization, sticky columns, or editing. Those richer components have not been ported yet. Native screen-reader traversal differs from an HTML table; give controls and the root meaningful accessibility labels.
