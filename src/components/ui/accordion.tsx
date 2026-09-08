import { useAccordion, useAccordionContext, useAccordionItemContext } from "@ark-ui/react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Accordion as AccordionPrimitive } from "@ark-ui/react"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

function AccordionRoot({ className, lazyMount = true, unmountOnExit = true, ...props }: AccordionRootProps) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      lazyMount={lazyMount}
      unmountOnExit={unmountOnExit}
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  )
}

function AccordionContext({ ...props }: AccordionContextProps) {
  return <AccordionPrimitive.Context {...props} />
}

function AccordionItem({ className, ...props }: AccordionItemProps) {
  return (
    <AccordionPrimitive.Item data-slot="accordion-item" className={cn("not-last:border-b", className)} {...props} />
  )
}

function AccordionItemContext({ ...props }: AccordionItemContextProps) {
  return <AccordionPrimitive.ItemContext {...props} />
}

function AccordionItemTrigger({ className, children, ...props }: AccordionItemTriggerProps) {
  return (
    <AccordionPrimitive.ItemTrigger
      data-slot="accordion-trigger"
      className={cn(
        "group/accordion-trigger relative flex w-full flex-1 items-start justify-between rounded-lg border border-transparent py-2.5 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:after:border-ring disabled:pointer-events-none disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground",
        className
      )}
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          {children}
          <ChevronDownIcon
            data-slot="accordion-trigger-icon"
            className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
          />
          <ChevronUpIcon
            data-slot="accordion-trigger-icon"
            className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
          />
        </>
      )}
    </AccordionPrimitive.ItemTrigger>
  )
}

function AccordionItemIndicator({ className, ...props }: AccordionItemIndicatorProps) {
  return (
    <AccordionPrimitive.ItemIndicator
      data-slot="accordion-item-indicator"
      className={cn(
        "ml-auto size-4 shrink-0 text-muted-foreground transition-transform data-open:rotate-180",
        className
      )}
      {...props}
    />
  )
}

function AccordionItemContent({ className, children, ...props }: AccordionItemContentProps) {
  return (
    <AccordionPrimitive.ItemContent
      data-slot="accordion-content"
      className="overflow-hidden text-sm [--accordion-panel-height:var(--height)] data-open:animate-accordion-down data-closed:animate-accordion-up"
      {...props}
    >
      {props.asChild ? (
        React.isValidElement(children) ? (
          children
        ) : null
      ) : (
        <>
          <div
            className={cn(
              "pt-0 pb-2.5 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
              className
            )}
          >
            {children}
          </div>
        </>
      )}
    </AccordionPrimitive.ItemContent>
  )
}

function AccordionRootProvider({ className, ...props }: AccordionRootProviderProps) {
  return (
    <AccordionPrimitive.RootProvider
      data-slot="accordion"
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  )
}

type AccordionItemContentProps = React.ComponentProps<typeof AccordionPrimitive.ItemContent>

type AccordionItemTriggerProps = React.ComponentProps<typeof AccordionPrimitive.ItemTrigger>

type AccordionRootProps = React.ComponentProps<typeof AccordionPrimitive.Root>

type AccordionRootProviderProps = React.ComponentProps<typeof AccordionPrimitive.RootProvider>

type AccordionContextProps = React.ComponentProps<typeof AccordionPrimitive.Context>

type AccordionItemProps = React.ComponentProps<typeof AccordionPrimitive.Item>

type AccordionItemContextProps = React.ComponentProps<typeof AccordionPrimitive.ItemContext>

type AccordionItemIndicatorProps = React.ComponentProps<typeof AccordionPrimitive.ItemIndicator>

const Accordion = {
  ItemContent: AccordionItemContent,
  ItemTrigger: AccordionItemTrigger,
  Root: AccordionRoot,
  RootProvider: AccordionRootProvider,
  Context: AccordionContext,
  Item: AccordionItem,
  ItemContext: AccordionItemContext,
  ItemIndicator: AccordionItemIndicator,
}

export {
  useAccordion,
  useAccordionContext,
  useAccordionItemContext,
  Accordion,
  type AccordionItemContentProps,
  type AccordionItemTriggerProps,
  type AccordionRootProps,
  type AccordionRootProviderProps,
  type AccordionContextProps,
  type AccordionItemProps,
  type AccordionItemContextProps,
  type AccordionItemIndicatorProps,
}
