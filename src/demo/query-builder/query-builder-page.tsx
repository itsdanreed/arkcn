import * as React from "react"
import { CheckIcon, CopyIcon, RotateCcwIcon } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { SegmentGroup, SegmentGroupIndicator, SegmentGroupItem } from "@/components/ui/segment-group"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { generateUsers, roles, statuses, statusStyles, type User } from "@/demo/users/data"
import { cn } from "@/lib/utils"
import { matches, toJson, toSql } from "./interpret"

/* ------------------------------- data ---------------------------------- */

const users = generateUsers(500)

/** Rows the query runs against: plain values keyed by field name. */
type Row = Record<string, unknown> & { user: User }
const rows: Row[] = users.map((u) => ({
  user: u,
  username: u.username,
  fullName: `${u.firstName} ${u.lastName}`,
  email: u.email,
  phoneNumber: u.phoneNumber,
  status: u.status,
  role: u.role,
  createdAt: u.createdAt,
  updatedAt: u.updatedAt,
  active: u.status === "active",
  daysSinceUpdate: Math.round((Date.now() - u.updatedAt.getTime()) / 86_400_000),
}))

const fields: QueryField[] = [
  { name: "fullName", label: "Name", type: "text", placeholder: "e.g. Alex" },
  { name: "username", label: "Username", type: "text" },
  { name: "email", label: "Email", type: "text", placeholder: "e.g. @example.com" },
  { name: "status", label: "Status", type: "select", options: statuses.map((s) => ({ ...s })) },
  { name: "role", label: "Role", type: "select", options: roles.map((r) => ({ value: r.value, label: r.label })) },
  { name: "active", label: "Is active", type: "boolean" },
  { name: "createdAt", label: "Created", type: "date" },
  { name: "updatedAt", label: "Last updated", type: "date" },
  { name: "daysSinceUpdate", label: "Days since update", type: "number" },
]

const iso = (daysAgo: number) => new Date(Date.now() - daysAgo * 86_400_000).toISOString().slice(0, 10)

const presets: { label: string; build: () => QueryGroup }[] = [
  {
    label: "Active admins",
    build: () =>
      createGroup("all", [
        createRule(fields, undefined, { field: "status", operator: "is", value: "active" }),
        createRule(fields, undefined, { field: "role", operator: "anyOf", value: ["admin", "superadmin"] }),
      ]),
  },
  {
    label: "Stale invites",
    build: () =>
      createGroup("all", [
        createRule(fields, undefined, { field: "status", operator: "is", value: "invited" }),
        createRule(fields, undefined, { field: "daysSinceUpdate", operator: "greaterThan", value: "5" }),
      ]),
  },
  {
    label: "Needs attention",
    build: () =>
      createGroup("any", [
        createRule(fields, undefined, { field: "status", operator: "is", value: "suspended" }),
        createGroup("all", [
          createRule(fields, undefined, { field: "status", operator: "is", value: "inactive" }),
          createRule(fields, undefined, { field: "createdAt", operator: "after", value: iso(30) }),
        ]),
      ]),
  },
]

/* ------------------------------ builder -------------------------------- */

/** Nested groups can be removed as a whole; the root cannot. */
function GroupRemove() {
  const { depth } = useQueryBuilderGroup()
  if (depth === 0) return null
  return <QueryBuilderRemoveTrigger className="ms-auto" />
}

/** Renders a group and its children recursively from the toolkit parts. */
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

/* -------------------------------- page --------------------------------- */

export function QueryBuilderPage() {
  const [query, setQuery] = React.useState<QueryGroup>(() => presets[0].build())
  const [format, setFormat] = React.useState<"sql" | "json">("sql")
  const [copied, setCopied] = React.useState(false)

  const matching = React.useMemo(() => rows.filter((row) => matches(query, row, fields)), [query])
  const output = React.useMemo(() => (format === "sql" ? toSql(query, fields) : toJson(query)), [query, format])
  const activePreset = presets.find((p) => toSql(p.build(), fields) === toSql(query, fields))

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Could not copy to the clipboard")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Segments</h2>
          <p className="text-muted-foreground">
            Build a customer segment from conditions that read like a sentence. Unfinished ones are ignored until you
            fill them in.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setQuery(createGroup("all", [createRule(fields)]))}
          disabled={query.rules.length === 0}
        >
          <RotateCcwIcon /> Start over
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Quick start:</span>
        {presets.map((preset) => (
          <Button
            key={preset.label}
            variant={activePreset?.label === preset.label ? "secondary" : "outline"}
            size="sm"
            onClick={() => setQuery(preset.build())}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Conditions</CardTitle>
            <CardDescription>
              <QueryBuilderPreview query={query} />
            </CardDescription>
          </CardHeader>
          <CardContent>
            <QueryBuilder fields={fields} value={query} onValueChange={setQuery}>
              <Group group={query} />
            </QueryBuilder>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Matching users
                <Badge variant="secondary" className="tabular-nums">
                  {matching.length} of {rows.length}
                </Badge>
              </CardTitle>
              <CardDescription>Updates as you type. Showing the first eight.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="ps-6">Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="pe-6">Role</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {matching.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-16 text-center text-muted-foreground">
                        No users match these conditions.
                      </TableCell>
                    </TableRow>
                  ) : (
                    matching.slice(0, 8).map(({ user }) => (
                      <TableRow key={user.id}>
                        <TableCell className="ps-6">
                          <div className="font-medium">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={cn("capitalize", statusStyles[user.status])}>
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="pe-6 capitalize">{user.role}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between gap-2">
              <div>
                <CardTitle>Output</CardTitle>
                <CardDescription>What the query becomes.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <SegmentGroup value={format} onValueChange={({ value }) => value && setFormat(value as "sql" | "json")}>
                  <SegmentGroupIndicator />
                  <SegmentGroupItem value="sql">SQL</SegmentGroupItem>
                  <SegmentGroupItem value="json">JSON</SegmentGroupItem>
                </SegmentGroup>
                <Button variant="outline" size="icon-sm" aria-label="Copy output" onClick={copy} disabled={!output}>
                  {copied ? <CheckIcon /> : <CopyIcon />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <pre className="max-h-64 overflow-auto rounded-lg bg-muted/50 p-3 font-mono text-xs/relaxed whitespace-pre-wrap">
                {output || <span className="text-muted-foreground">Nothing yet. Fill in a condition.</span>}
              </pre>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

/** The sentence summary needs the builder context, so it mounts its own root over the same value. */
function QueryBuilderPreview({ query }: { query: QueryGroup }) {
  return (
    <QueryBuilder fields={fields} value={query} className="contents">
      <QueryBuilderSummary />
    </QueryBuilder>
  )
}
