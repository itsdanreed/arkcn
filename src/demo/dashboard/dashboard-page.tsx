import * as React from "react"
import { Button } from "@/components/ui/button"
import { SegmentGroup, SegmentGroupIndicator, SegmentGroupItem } from "@/components/ui/segment-group"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Analytics } from "./analytics"
import { DashboardWidgets } from "./widgets"

/** Demo dashboard page. */
export function DashboardPage() {
  const [tab, setTab] = React.useState("overview")
  return (
    <>
      <div className="mb-2 flex items-center justify-between space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Button>Download</Button>
        </div>
      </div>
      <Tabs value={tab} onValueChange={({ value }) => setTab(value)} className="space-y-4">
        <div className="w-full overflow-x-auto pb-2">
          <SegmentGroup value={tab} onValueChange={({ value }) => value && setTab(value)}>
            <SegmentGroupIndicator />
            <SegmentGroupItem value="overview">Overview</SegmentGroupItem>
            <SegmentGroupItem value="analytics">Analytics</SegmentGroupItem>
            <SegmentGroupItem value="reports" disabled>
              Reports
            </SegmentGroupItem>
            <SegmentGroupItem value="notifications" disabled>
              Notifications
            </SegmentGroupItem>
          </SegmentGroup>
        </div>
        <TabsContent value="overview" className="space-y-4">
          <DashboardWidgets />
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Analytics />
        </TabsContent>
      </Tabs>
    </>
  )
}
