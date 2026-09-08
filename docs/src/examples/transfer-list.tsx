import * as React from "react"
import { TransferList } from "@/components/ui/transfer-list"

const permissions = [
  { value: "read", label: "View records" },
  { value: "edit", label: "Edit records" },
  { value: "delete", label: "Delete records" },
  { value: "export", label: "Export data" },
  { value: "billing", label: "Manage billing" },
  { value: "members", label: "Invite members" },
]

export default function TransferListExample() {
  const [granted, setGranted] = React.useState(["read", "export"])
  return (
    <TransferList.Root
      items={permissions}
      value={granted}
      onValueChange={({ value }) => setGranted(value)}
      className="w-full max-w-xl"
    >
      <TransferList.Panel side="source">
        <TransferList.PanelHeader>
          <TransferList.SelectAll />
          <TransferList.PanelTitle>Available</TransferList.PanelTitle>
          <TransferList.PanelCount />
        </TransferList.PanelHeader>
        <TransferList.Search placeholder="Filter" />
        <TransferList.Items />
        <TransferList.Empty />
      </TransferList.Panel>
      <TransferList.Controls>
        <TransferList.MoveAllTrigger direction="right" />
        <TransferList.MoveTrigger direction="right" />
        <TransferList.MoveTrigger direction="left" />
        <TransferList.MoveAllTrigger direction="left" />
      </TransferList.Controls>
      <TransferList.Panel side="target">
        <TransferList.PanelHeader>
          <TransferList.SelectAll />
          <TransferList.PanelTitle>Granted</TransferList.PanelTitle>
          <TransferList.PanelCount />
        </TransferList.PanelHeader>
        <TransferList.Search placeholder="Filter" />
        <TransferList.Items />
        <TransferList.Empty />
      </TransferList.Panel>
    </TransferList.Root>
  )
}
