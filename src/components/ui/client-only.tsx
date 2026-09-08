"use client"
import * as React from "react"
import { ClientOnly as ClientOnlyPrimitive } from "@ark-ui/react"

function ClientOnlyRoot(props: ClientOnlyRootProps) {
  return <ClientOnlyPrimitive {...props} />
}

type ClientOnlyRootProps = React.ComponentProps<typeof ClientOnlyPrimitive>

const ClientOnly = {
  Root: ClientOnlyRoot,
}

export { ClientOnly, type ClientOnlyRootProps }
