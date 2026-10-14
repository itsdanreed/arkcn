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

import { Button } from "@/components/ui/button"
import { useAuditMotion } from "../audit-motion"

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
  return depth === 0 ? null : <QueryBuilder.RemoveTrigger />
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
  const [disabled, setDisabled] = React.useState(false)
  const { trace } = useAuditMotion('[data-slot="select-content"], [data-slot="query-builder-rule-actions"]')
  const [query, setQuery] = React.useState<QueryGroup>(() =>
    createGroup("all", [
      createRule(fields, undefined, { field: "plan", operator: "is", value: "pro" }),
      createRule(fields, undefined, { field: "seats", operator: "greaterThan", value: 5 }),
    ])
  )
  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" aria-pressed={disabled} onClick={() => setDisabled(!disabled)}>
          Disabled
        </Button>
        <Button variant="outline" onClick={() => setQuery(createGroup("all", []))}>
          Clear
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            setQuery(
              createGroup("all", [
                createRule(fields, undefined, { field: "name", operator: "contains", value: "Ada" }),
                createRule(fields, undefined, {
                  field: "signedUp",
                  operator: "between",
                  value: ["2026-10-01", "2026-10-14"],
                }),
                createRule(fields, undefined, { field: "active", operator: "isTrue" }),
                createGroup("any", [
                  createRule(fields, undefined, { field: "plan", operator: "anyOf", value: ["free", "pro"] }),
                  createRule(fields, undefined, { field: "seats", operator: "atLeast", value: 10 }),
                ]),
              ])
            )
          }
        >
          Editor variants
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            setQuery(
              createGroup("all", [
                createRule(fields, undefined, { field: "active", operator: "isTrue" }),
                createGroup("any", [
                  createRule(fields, undefined, { field: "plan", operator: "is", value: "pro" }),
                  createGroup("all", [
                    createRule(fields, undefined, { field: "seats", operator: "atLeast", value: 10 }),
                    createGroup("any", [
                      createRule(fields, undefined, { field: "name", operator: "startsWith", value: "Ada" }),
                      createRule(fields, undefined, { field: "name", operator: "startsWith", value: "Grace" }),
                    ]),
                  ]),
                ]),
              ])
            )
          }
        >
          Deep groups
        </Button>
      </div>
      <QueryBuilder.Root disabled={disabled} fields={fields} value={query} onValueChange={setQuery}>
        <Group group={query} />
        <QueryBuilder.Summary />
      </QueryBuilder.Root>
      <output hidden data-audit-query>
        {JSON.stringify(query)}
      </output>
      <output hidden data-audit-motion>
        {trace}
      </output>
    </div>
  )
}
