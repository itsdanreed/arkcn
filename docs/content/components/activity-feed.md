## How it works

A timeline of events on the WAI-ARIA feed pattern: the root is `role="feed"`, each item is a focusable article, Page Up and Page Down move between items, and Ctrl+Home and Ctrl+End jump to the ends. Data, grouping, and read state are yours; the parts only lay them out.

## Parts

`ActivityFeedGroup` with an `ActivityFeedGroupLabel` ("Today", "Yesterday") holds `ActivityFeedItems`, which draws the connector line. Each `ActivityFeedItem value=` has an `ActivityFeedItemMarker` (a dot by default, or pass an icon or an avatar) and `ActivityFeedItemContent` with an `ActivityFeedItemHeader` (`ActivityFeedItemActor`, your summary, `ActivityFeedItemTime date=` with a relative label and the full date in its title), an optional `ActivityFeedItemBody`, and `ActivityFeedItemActions`. `ActivityFeedLoadMoreTrigger` and `ActivityFeedEmpty` complete the set.

## Notes

- Mark unread items with a `data-unread` attribute and style it; the feed does not track read state.
- Relative labels come from `lib/time`'s `formatRelativeTime`.
