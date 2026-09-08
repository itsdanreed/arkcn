"use client"
import * as React from "react"
import { Presence as PresencePrimitive, usePresence, usePresenceContext, PresenceProvider } from "@ark-ui/react"
import { cn } from "@/lib/utils"

function PresenceRoot({ className, ...props }: PresenceRootProps) {
  return <PresencePrimitive data-slot="presence" className={cn("", className)} {...props} />
}

type PresenceRootProps = React.ComponentProps<typeof PresencePrimitive>

type PresenceProviderProps = React.ComponentProps<typeof PresenceProvider>

const Presence = {
  Root: PresenceRoot,
  Provider: PresenceProvider,
}

export { Presence, usePresence, usePresenceContext, type PresenceRootProps, type PresenceProviderProps }
