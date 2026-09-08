# Conventions

## Imports and parts

Import a component namespace and compose its parts. Public parts follow Ark's names, including `Root`, `RootProvider`, `Context`, and component-specific parts such as `Accordion.ItemTrigger`.

```tsx
import { Accordion } from "@/components/ui/accordion"

<Accordion.Root>
  <Accordion.Item value="details">
    <Accordion.ItemTrigger>Details</Accordion.ItemTrigger>
    <Accordion.ItemContent>More information.</Accordion.ItemContent>
  </Accordion.Item>
</Accordion.Root>
```

The namespace convention also applies to compound HTML components and other integrations: `Card.Root`, `Card.Title`, and the Embla-backed `Carousel.Root`. Button is a standalone component, so use `<Button>` directly and import `ButtonProps` for its prop type. Compound components do not provide flat compatibility exports. Hooks and collection helpers remain named exports.

Roots are compositional. For example, explicitly include `Switch.Control`, `Switch.Thumb`, and `Switch.HiddenInput` inside `Switch.Root`.

DOM parts carry `data-slot` attributes for styling. Providers and render-only helpers do not add an element merely to carry an attribute.

## Implementation names and prop types

Each compositional part has a descriptive private implementation name matching its public member: `Accordion.ItemTrigger` uses `AccordionItemTrigger`, and `Card.Root` uses `CardRoot`. Keep each component in one file and export its component object together with named prop aliases. Do not export the individual compositional functions or use merged TypeScript namespaces.

```tsx
import { AlertDialog, type AlertDialogHeaderProps } from "@/components/ui/alert-dialog"

interface CustomHeaderProps extends AlertDialogHeaderProps {
  eyebrow?: string
}

function CustomHeader({ eyebrow, children, ...props }: CustomHeaderProps) {
  return (
    <AlertDialog.Header {...props}>
      {eyebrow && <p>{eyebrow}</p>}
      {children}
    </AlertDialog.Header>
  )
}
```

The implementation itself uses `AlertDialogHeaderProps` in its function signature. Generic aliases preserve item and row types, such as `DataTableBodyProps<MyRow>` and `SelectRootProps<MyOption>`.

## Polymorphism

Parts with a replaceable DOM element accept `asChild`. Pass one element that forwards its props and ref. The part merges its behavior, classes, and accessibility attributes onto that element; default icons and additional content are omitted.

```tsx
import { Dialog } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

<Dialog.Trigger asChild>
  <Button variant="outline">Open</Button>
</Dialog.Trigger>
```

HTML parts use Ark's factory, such as `ark.div`. Their types use `React.ComponentProps<typeof ark.div>`, which includes `HTMLArkProps`'s `asChild` support and the element's ref type. Ark-backed parts use the corresponding Ark prop types.

An `asChild` prop is not meaningful on a provider without a DOM element or a helper that returns multiple formatted text fragments. Integrations that own their rendered DOM, such as an iframe, editor, calendar, or Sonner's notification renderer, retain their underlying rendering APIs. Consult each part's prop table instead of assuming every renderer can change element type.

## State and providers

Use the controlled and uncontrolled props from Ark: `value` / `defaultValue` / `onValueChange`, `open` / `defaultOpen` / `onOpenChange`, or the component's specific equivalent. `RootProvider` accepts the matching hook's return value when state must be accessed outside the root.

Data components keep interaction state separate from application data and report edits through callbacks.

## Ids

Prefer the root's documented `id` or `ids` API to configure accessible relationships. Replacing a generated part id can break the state machine's element lookups. Field's root `id` identifies its input; use `Field.Label`, `Field.HelperText`, and `Field.ErrorText` for automatic associations.

## Styling and accessibility

Classes are merged with `cn`; variants use `cva`. Style state through the component's documented Ark data attributes. Custom elements must preserve the required semantics and keyboard behavior: a visual button should remain a button unless the action is navigation.
