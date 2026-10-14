"use client"
import * as React from "react"
import { Portal as PortalPrimitive } from "@ark-ui/react"

function PortalRoot(props: PortalRootProps) {
  return <PortalPrimitive {...props} />
}

type PortalRootProps = React.ComponentProps<typeof PortalPrimitive>

const Portal = {
  Root: PortalRoot,
}

export { Portal, type PortalRootProps }
