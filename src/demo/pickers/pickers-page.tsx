import * as React from "react"
import { FolderIcon, FolderOpenIcon, UserIcon, UsersIcon } from "lucide-react"
import {
  Cascader,
  CascaderClearTrigger,
  CascaderColumns,
  CascaderContent,
  CascaderEmpty,
  CascaderIndicator,
  CascaderSearch,
  CascaderSearchResults,
  CascaderTrigger,
  CascaderValue,
} from "@/components/ui/cascader"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import {
  TreeSelect,
  TreeSelectChip,
  TreeSelectChips,
  TreeSelectClearTrigger,
  TreeSelectContent,
  TreeSelectEmpty,
  TreeSelectIndicator,
  TreeSelectSearch,
  TreeSelectTree,
  TreeSelectTrigger,
  TreeSelectValue,
} from "@/components/ui/tree-select"
import {
  TransferList,
  TransferListControls,
  TransferListEmpty,
  TransferListItems,
  TransferListMoveAllTrigger,
  TransferListMoveTrigger,
  TransferListPanel,
  TransferListPanelCount,
  TransferListPanelHeader,
  TransferListPanelTitle,
  TransferListSearch,
  TransferListSelectAll,
} from "@/components/ui/transfer-list"
import { Badge } from "@/components/ui/badge"
import { categories, folders, locations, org, permissions, type Node, type Permission } from "./data"

function Readout({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-xs text-muted-foreground">
      {label}: <code className="rounded-sm bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground">{value}</code>
    </p>
  )
}

export function PickersPage() {
  const [folder, setFolder] = React.useState<string[]>(["projects/toolkit/specs"])
  const [people, setPeople] = React.useState<string[]>(["u-ava", "u-noah", "u-mia", "u-ella"])
  const [location, setLocation] = React.useState<string[]>(["us-ca-sf"])
  const [category, setCategory] = React.useState<string[]>([])
  const [granted, setGranted] = React.useState<string[]>(["read", "comment", "export"])
  const [locationPath, setLocationPath] = React.useState<string>("United States / California / San Francisco")

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Roles &amp; access</h2>
        <p className="text-muted-foreground">
          Scope what people can see and do: folders, teams, regions, categories, and permissions.
        </p>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tree select</CardTitle>
            <CardDescription>Pick one node from a hierarchy, or many with branch checkboxes.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <Field>
              <FieldLabel>Move to folder</FieldLabel>
              <TreeSelect
                collection={folders}
                value={folder}
                onValueChange={({ value }) => setFolder(value)}
                selectableBranches
                defaultExpandedValue={["projects", "projects/toolkit"]}
              >
                <TreeSelectTrigger aria-label="Folder">
                  <TreeSelectValue<Node> placeholder="Choose a folder">
                    {(nodes) => (
                      <span className="flex items-center gap-1.5">
                        <FolderIcon className="text-muted-foreground" />
                        {folders
                          .getParentNodes(folders.getNodeValue(nodes[0]))
                          .filter((n) => !folders.isRootNode(n))
                          .map((n) => (
                            <span key={n.value} className="text-muted-foreground">
                              {n.label} /
                            </span>
                          ))}
                        {nodes[0].label}
                      </span>
                    )}
                  </TreeSelectValue>
                  <TreeSelectClearTrigger />
                  <TreeSelectIndicator />
                </TreeSelectTrigger>
                <TreeSelectContent>
                  <TreeSelectSearch placeholder="Find a folder" />
                  <TreeSelectTree<Node>>
                    {(node) => (
                      <span className="flex items-center gap-1.5">
                        {node.children ? (
                          <FolderOpenIcon className="text-muted-foreground" />
                        ) : (
                          <FolderIcon className="text-muted-foreground" />
                        )}
                        {node.label}
                      </span>
                    )}
                  </TreeSelectTree>
                  <TreeSelectEmpty>No folder matches</TreeSelectEmpty>
                </TreeSelectContent>
              </TreeSelect>
              <FieldDescription>Folders themselves can be picked; the search auto-expands matches.</FieldDescription>
              <Readout label="value" value={JSON.stringify(folder)} />
            </Field>

            <Field>
              <FieldLabel>Share with</FieldLabel>
              <TreeSelect
                collection={org}
                multiple
                value={people}
                onValueChange={({ value }) => setPeople(value)}
                defaultExpandedValue={["eng", "design"]}
              >
                <TreeSelectTrigger aria-label="People">
                  <TreeSelectChips<Node> placeholder="Add people or teams">
                    {(node) => <TreeSelectChipWithIcon node={node} />}
                  </TreeSelectChips>
                  <TreeSelectClearTrigger />
                  <TreeSelectIndicator />
                </TreeSelectTrigger>
                <TreeSelectContent>
                  <TreeSelectSearch placeholder="Find people" />
                  <TreeSelectTree />
                  <TreeSelectEmpty>Nobody matches</TreeSelectEmpty>
                </TreeSelectContent>
              </TreeSelect>
              <FieldDescription>
                A whole team collapses into one chip when everyone in it is selected. Backspace removes the last chip.
              </FieldDescription>
              <Readout label="value" value={JSON.stringify(people)} />
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cascader</CardTitle>
            <CardDescription>Drill through columns; the answer reads as a path.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-6">
            <Field>
              <FieldLabel>Location</FieldLabel>
              <Cascader
                collection={locations}
                value={location}
                onValueChange={({ value, path }) => {
                  setLocation(value)
                  setLocationPath(path.map((n) => n.label).join(" / "))
                }}
                expandTrigger="hover"
              >
                <CascaderTrigger aria-label="Location">
                  <CascaderValue placeholder="Country / State / City" />
                  <CascaderClearTrigger />
                  <CascaderIndicator />
                </CascaderTrigger>
                <CascaderContent>
                  <CascaderSearch placeholder="Search cities" />
                  <CascaderColumns />
                  <CascaderSearchResults />
                  <CascaderEmpty />
                </CascaderContent>
              </Cascader>
              <FieldDescription>
                Hover opens the next column. Arrow keys move across columns; type to search every level.
              </FieldDescription>
              <Readout label="path" value={location.length ? locationPath : "none"} />
            </Field>

            <Field>
              <FieldLabel>Category</FieldLabel>
              <Cascader
                collection={categories}
                value={category}
                onValueChange={({ value }) => setCategory(value)}
                changeOnSelect
              >
                <CascaderTrigger aria-label="Category">
                  <CascaderValue placeholder="Any category" />
                  <CascaderClearTrigger />
                  <CascaderIndicator />
                </CascaderTrigger>
                <CascaderContent>
                  <CascaderColumns />
                  <CascaderEmpty />
                </CascaderContent>
              </Cascader>
              <FieldDescription>
                With change-on-select, a parent category is a valid answer on its own. Click a leaf to close.
              </FieldDescription>
              <Readout label="value" value={JSON.stringify(category)} />
            </Field>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transfer list</CardTitle>
          <CardDescription>
            Move items between two lists. Tick items and use the arrows, double-click, or press Enter on a focused item.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <TransferList
            items={permissions}
            value={granted}
            onValueChange={({ value }) => setGranted(value)}
            titles={{ source: "Available", target: "Granted" }}
            className="lg:max-w-3xl"
          >
            <TransferListPanel side="source">
              <TransferListPanelHeader>
                <TransferListSelectAll />
                <TransferListPanelTitle>Available</TransferListPanelTitle>
                <TransferListPanelCount />
              </TransferListPanelHeader>
              <TransferListSearch placeholder="Filter permissions" />
              <TransferListItems<Permission>>
                {(item) => (
                  <span className="flex min-w-0 flex-1 items-center gap-2">
                    <span className="truncate">{item.label}</span>
                    {item.group && (
                      <Badge variant="outline" className="ml-auto h-4 px-1.5 text-[10px]">
                        {item.group}
                      </Badge>
                    )}
                  </span>
                )}
              </TransferListItems>
              <TransferListEmpty />
            </TransferListPanel>
            <TransferListControls>
              <TransferListMoveAllTrigger direction="right" />
              <TransferListMoveTrigger direction="right" />
              <TransferListMoveTrigger direction="left" />
              <TransferListMoveAllTrigger direction="left" />
            </TransferListControls>
            <TransferListPanel side="target">
              <TransferListPanelHeader>
                <TransferListSelectAll />
                <TransferListPanelTitle>Granted</TransferListPanelTitle>
                <TransferListPanelCount />
              </TransferListPanelHeader>
              <TransferListSearch placeholder="Filter granted" />
              <TransferListItems />
              <TransferListEmpty>No permissions granted</TransferListEmpty>
            </TransferListPanel>
          </TransferList>
          <Readout label="value" value={JSON.stringify(granted)} />
        </CardContent>
      </Card>
    </div>
  )
}

function TreeSelectChipWithIcon({ node }: { node: Node }) {
  return (
    <TreeSelectChip node={node}>
      {node.children ? (
        <UsersIcon className="size-3 text-muted-foreground" />
      ) : (
        <UserIcon className="size-3 text-muted-foreground" />
      )}
      {node.label}
    </TreeSelectChip>
  )
}
