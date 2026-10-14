# Highlight

Highlight.Root divides text into matching and nonmatching fragments for a query and renders matches with mark elements. Change ignoreCase, matchAll, or exactMatch to control matching.

Because the result can contain several text fragments and marks, there is no single root element to replace. useHighlight returns the chunks for a custom renderer.

A string query matches the first case-sensitive occurrence by default. Use matchAll for every occurrence and ignoreCase for case-insensitive matching. An array of queries matches all occurrences by default; punctuation is treated literally.

className and other mark attributes apply to each matching fragment. Marks inherit the surrounding font, size, weight, italics, and line height; their background and foreground use the theme colors. Empty or unmatched queries leave the text unmarked.
