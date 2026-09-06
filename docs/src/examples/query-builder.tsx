import * as React from "react"
import {
  QueryBuilder,
  QueryBuilderAddGroupTrigger,
  QueryBuilderAddRuleTrigger,
  QueryBuilderFieldSelect,
  QueryBuilderGroup,
  QueryBuilderGroupBody,
  QueryBuilderGroupFooter,
  QueryBuilderGroupHeader,
  QueryBuilderMatch,
  QueryBuilderOperatorSelect,
  QueryBuilderRemoveTrigger,
  QueryBuilderRule,
  QueryBuilderRuleActions,
  QueryBuilderSummary,
  QueryBuilderValueEditor,
  createGroup,
  createRule,
  isGroup,
  useQueryBuilderGroup,
  type QueryField,
  type QueryGroup,
} from "@/components/ui/query-builder"

const fields: QueryField[] = [
  { name: "name", label: "Name", type: "text" },
  {
    name: "plan",
    label: "Plan",
    type: "select",
    options: [
      { value: "free", label: "Free" },
      { value: "pro", label: "Pro" },
    ],
  },
  { name: "seats", label: "Seats", type: "number" },
  { name: "active", label: "Is active", type: "boolean" },
  { name: "signedUp", label: "Signed up", type: "date" },
]

function GroupRemove() {
  const { depth } = useQueryBuilderGroup()
  return depth === 0 ? null : <QueryBuilderRemoveTrigger className="ms-auto" />
}

// The consumer renders groups recursively from the parts; the root applies edits.
function Group({ group }: { group: QueryGroup }) {
  return (
    <QueryBuilderGroup group={group}>
      <QueryBuilderGroupHeader>
        <QueryBuilderMatch />
        <GroupRemove />
      </QueryBuilderGroupHeader>
      <QueryBuilderGroupBody>
        {group.rules.map((node) =>
          isGroup(node) ? (
            <Group key={node.id} group={node} />
          ) : (
            <QueryBuilderRule key={node.id} rule={node}>
              <QueryBuilderFieldSelect />
              <QueryBuilderOperatorSelect />
              <QueryBuilderValueEditor />
              <QueryBuilderRuleActions>
                <QueryBuilderRemoveTrigger />
              </QueryBuilderRuleActions>
            </QueryBuilderRule>
          )
        )}
      </QueryBuilderGroupBody>
      <QueryBuilderGroupFooter>
        <QueryBuilderAddRuleTrigger />
        <QueryBuilderAddGroupTrigger />
      </QueryBuilderGroupFooter>
    </QueryBuilderGroup>
  )
}

export default function QueryBuilderExample() {
  const [query, setQuery] = React.useState<QueryGroup>(() =>
    createGroup("all", [
      createRule(fields, undefined, { field: "plan", operator: "is", value: "pro" }),
      createRule(fields, undefined, { field: "seats", operator: "gt", value: 5 }),
    ])
  )
  return (
    <div className="flex w-full flex-col gap-4">
      <QueryBuilder fields={fields} value={query} onValueChange={setQuery}>
        <Group group={query} />
        <QueryBuilderSummary className="text-sm text-muted-foreground" />
      </QueryBuilder>
    </div>
  )
}
