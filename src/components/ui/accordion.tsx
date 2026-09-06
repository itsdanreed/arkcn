import * as React from "react"
import { cn } from "@/lib/utils"
import { Accordion as AccordionPrimitive } from "@ark-ui/react"
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react"

function Accordion({
  className,
  lazyMount = true,
  unmountOnExit = true,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
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

function AccordionContext({ ...props }: React.ComponentProps<typeof AccordionPrimitive.Context>) {
  return <AccordionPrimitive.Context {...props} />
}

function AccordionItem({ className, ...props }: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item data-slot="accordion-item" className={cn("not-last:border-b", className)} {...props} />
  )
}

function AccordionItemContext({ ...props }: React.ComponentProps<typeof AccordionPrimitive.ItemContext>) {
  return <AccordionPrimitive.ItemContext {...props} />
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.ItemTrigger>) {
  return (
    <AccordionPrimitive.ItemTrigger
      data-slot="accordion-trigger"
      className={cn(
        "group/accordion-trigger relative flex w-full flex-1 items-start justify-between rounded-lg border border-transparent py-2.5 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:after:border-ring disabled:pointer-events-none disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDownIcon
        data-slot="accordion-trigger-icon"
        className="pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden"
      />
      <ChevronUpIcon
        data-slot="accordion-trigger-icon"
        className="pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline"
      />
    </AccordionPrimitive.ItemTrigger>
  )
}

function AccordionItemIndicator({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.ItemIndicator>) {
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

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.ItemContent>) {
  return (
    <AccordionPrimitive.ItemContent
      data-slot="accordion-content"
      className="overflow-hidden text-sm [--accordion-panel-height:var(--height)] data-open:animate-accordion-down data-closed:animate-accordion-up"
      {...props}
    >
      <div
        className={cn(
          "pt-0 pb-2.5 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.ItemContent>
  )
}

export {
  Accordion,
  AccordionContent,
  AccordionContext,
  AccordionItem,
  AccordionItemContext,
  AccordionItemIndicator,
  AccordionTrigger,
}
