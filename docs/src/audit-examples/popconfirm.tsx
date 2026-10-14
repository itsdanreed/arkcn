import { useState } from "react"
import { Popconfirm } from "@/components/ui/popconfirm"
import { Button } from "@/components/ui/button"
import { useAuditMotion } from "../audit-motion"
export default function Example() {
  const [status, setStatus] = useState("Ready")
  const [attempted, setAttempted] = useState(false)
  const { trace } = useAuditMotion('[data-slot="popconfirm-content"]', 300)
  return (
    <div className="flex flex-wrap gap-3 pt-48">
      {["default", "keep-open"].map((state) => (
        <Popconfirm.Root key={state}>
          <Popconfirm.Trigger asChild>
            <Button variant="outline">Open {state}</Button>
          </Popconfirm.Trigger>
          <Popconfirm.Content showArrow={false} data-audit-case={state}>
            <Popconfirm.Header>
              <Popconfirm.Title>Delete this file?</Popconfirm.Title>
              <Popconfirm.Description>It cannot be recovered.</Popconfirm.Description>
            </Popconfirm.Header>
            <Popconfirm.Footer>
              <Popconfirm.CancelTrigger />
              <Popconfirm.ConfirmTrigger
                onConfirm={(e) => {
                  setStatus("Confirmed")
                  if (state === "keep-open" && !attempted) {
                    e.preventDefault()
                    setAttempted(true)
                  }
                }}
              >
                Delete
              </Popconfirm.ConfirmTrigger>
            </Popconfirm.Footer>
          </Popconfirm.Content>
        </Popconfirm.Root>
      ))}
      <p role="status">{status}</p>
      <output hidden data-motion-trace>
        {trace}
      </output>
    </div>
  )
}
