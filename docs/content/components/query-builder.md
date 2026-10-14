## How it works

A filter builder with one All/Any dropdown per group. All requires every immediate condition or child group to match; Any requires at least one. Each condition reads field, then a plain-language operator, then a value. Negation lives in the operator wording, and order never matters. Incomplete conditions are flagged with `data-incomplete` and dropped by `pruneQuery` rather than erroring.

The primitive never interprets the tree. You own the `QueryGroup` value (`{ id, match, rules }` with nested groups) and render it recursively from the parts; the root applies edits and calls `onValueChange`. Turning the tree into SQL, an API payload, or an in-memory predicate is your job, and the demo has an interpreter you can copy.

## Fields and operators

Fields are data: `{ name, label, type, options, operators, placeholder }` with types `text`, `number`, `date`, `boolean`, and `select`. `defaultOperators` covers the usual set (`is`, `is not`, `contains`, `is after`, `is between`, `is any of`, `is empty`, and so on) with an `arity` of none, one, two, or many; pass your own list to add or restrict.

## Parts

`QueryBuilder.Group group={group}` provides the logical scope. Inside it, `QueryBuilder.GroupSection` draws a card for that group's own controls: a `GroupHeader` with `Match` and a nested group's trash `RemoveTrigger`, a `RuleList` of local condition rows separated by dividers, and a `GroupFooter` with `AddRuleTrigger` and `AddGroupTrigger`. The latter hides at `maxDepth`.

Render child groups in `QueryBuilder.GroupBody` **after** `GroupSection`, outside the card. An exterior guide begins beside the parent's All/Any header and continues down the left of its child cards. Each nesting level adds 16px of indentation; short branches meet the card headers. Each child has its own separate card below the parent; no card encloses another card, and there is no surrounding root card. All groups stay expanded. The example separates local rules from child groups for display; matching is independent of rule order, and the underlying tree stays intact.

Trash buttons align to the right edge of each condition and group header. `RuleActions` reserves its own space. Conditions use a shared grid within each RuleList. Field and operator columns fit the longest label in the group, values use the remaining width, and actions have their own column. Text and number editors have a subtle field surface and border. Trash buttons share the same muted styling and remain visible on touch; hover and keyboard focus emphasize them. Both add actions include a plus icon.

`QueryBuilder.Rule rule={rule}` composes `FieldSelect`, `OperatorSelect`, `ValueEditor`, and `RuleActions`. The value editor follows field type and operator arity; a render-prop child can override it. Value inputs use 14px typography to match the selectors. Date cells show a compact date or date-range summary. Clicking the cell opens arkcn's DatePicker in single or range selection mode. Its calendar supports day, month, and year navigation, highlights the selected range, and offers a clear action.

`QueryBuilder.Summary` renders a natural-language sentence, also available as `describeQuery`. It uses “either” for Any groups, quotes text/option values, formats dates in the same human-readable form as the editor, and keeps each emphasized value unbroken. It reports unfinished conditions separately; `pruneQuery` omits those conditions.
