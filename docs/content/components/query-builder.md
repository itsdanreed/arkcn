## How it works

A filter builder that reads like a sentence instead of a grid of AND/OR toggles. Each group has one `QueryBuilderMatch` control ("Match all" or "Match any"), each condition reads field, then a plain-language operator, then a value, negation lives in the operator wording, and order never matters. Incomplete conditions are flagged with `data-incomplete` and dropped by `pruneQuery` rather than erroring.

The primitive never interprets the tree. You own the `QueryGroup` value (`{ id, match, rules }` with nested groups) and render it recursively from the parts; the root applies edits and calls `onValueChange`. Turning the tree into SQL, an API payload, or an in-memory predicate is your job, and the demo has an interpreter you can copy.

## Fields and operators

Fields are data: `{ name, label, type, options, operators, placeholder }` with types `text`, `number`, `date`, `boolean`, and `select`. `defaultOperators` covers the usual set (`is`, `is not`, `contains`, `is after`, `is between`, `is any of`, `is empty`, and so on) with an `arity` of none, one, two, or many; pass your own list to add or restrict.

## Parts

`QueryBuilderGroup group=` with a `QueryBuilderGroupHeader` holding the match control and a `QueryBuilderRemoveTrigger`, a `QueryBuilderGroupBody` with the guide line, and a `QueryBuilderGroupFooter` with `QueryBuilderAddRuleTrigger` and `QueryBuilderAddGroupTrigger` (hidden past `maxDepth`). `QueryBuilderRule rule=` composes `QueryBuilderFieldSelect`, `QueryBuilderOperatorSelect`, `QueryBuilderValueEditor` (inputs by type and arity; a render-prop child can override), and hover-revealed `QueryBuilderRuleActions`. `QueryBuilderSummary` renders the natural-language sentence, which is also available as `describeQuery`.
