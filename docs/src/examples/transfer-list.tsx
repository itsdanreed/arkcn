import * as React from "react"
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
    <TransferList
      items={permissions}
      value={granted}
      onValueChange={({ value }) => setGranted(value)}
      className="w-full max-w-xl"
    >
      <TransferListPanel side="source">
        <TransferListPanelHeader>
          <TransferListSelectAll />
          <TransferListPanelTitle>Available</TransferListPanelTitle>
          <TransferListPanelCount />
        </TransferListPanelHeader>
        <TransferListSearch placeholder="Filter" />
        <TransferListItems />
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
        <TransferListSearch placeholder="Filter" />
        <TransferListItems />
        <TransferListEmpty />
      </TransferListPanel>
    </TransferList>
  )
}
