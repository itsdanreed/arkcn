import * as React from "react"
import {
  QueryBuilder,
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
  return depth === 0 ? null : <QueryBuilder.RemoveTrigger className="ms-auto" />
}

// The consumer renders groups recursively from the parts; the root applies edits.
function Group({ group }: { group: QueryGroup }) {
  return (
    <QueryBuilder.Group group={group}>
      <QueryBuilder.GroupHeader>
        <QueryBuilder.Match />
        <GroupRemove />
      </QueryBuilder.GroupHeader>
      <QueryBuilder.GroupBody>
        {group.rules.map((node) =>
          isGroup(node) ? (
            <Group key={node.id} group={node} />
          ) : (
            <QueryBuilder.Rule key={node.id} rule={node}>
              <QueryBuilder.FieldSelect />
              <QueryBuilder.OperatorSelect />
              <QueryBuilder.ValueEditor />
              <QueryBuilder.RuleActions>
                <QueryBuilder.RemoveTrigger />
              </QueryBuilder.RuleActions>
            </QueryBuilder.Rule>
          )
        )}
      </QueryBuilder.GroupBody>
      <QueryBuilder.GroupFooter>
        <QueryBuilder.AddRuleTrigger />
        <QueryBuilder.AddGroupTrigger />
      </QueryBuilder.GroupFooter>
    </QueryBuilder.Group>
  )
}

export default function QueryBuilderExample() {
  const [query, setQuery] = React.useState<QueryGroup>(() =>
    createGroup("all", [
      createRule(fields, undefined, { field: "plan", operator: "is", value: "pro" }),
      createRule(fields, undefined, { field: "seats", operator: "greaterThan", value: 5 }),
    ])
  )
  return (
    <div className="flex w-full flex-col gap-4">
      <QueryBuilder.Root fields={fields} value={query} onValueChange={setQuery}>
        <Group group={query} />
        <QueryBuilder.Summary className="text-sm text-muted-foreground" />
      </QueryBuilder.Root>
    </div>
  )
}
