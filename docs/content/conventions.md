# Conventions

These are the rules the components follow. They matter when you edit the copied files or build your own parts on top.

## Parts

Every part is its own exported component and sets `data-slot="<component>-<part>"`. Target parts from a parent with Tailwind's arbitrary variants, for example `*:data-[slot=card-title]:font-semibold`, or from a stylesheet with `[data-slot="dialog-content"]`.

## Polymorphism

Clickable parts are named `*Trigger` and accept `asChild`. With `asChild`, the part renders your child unchanged: no default icon, no screen-reader text, no badge.

```tsx
<DialogTrigger asChild>
  <Button variant="outline">Open</Button>
</DialogTrigger>
```

Drag handles are named `*Handle` and are polymorphic the same way.

## Ids

Never pass `id` to an Ark part. Ark looks parts up by the ids it generates; overriding one breaks the internal wiring. Use the root's `ids` prop instead when a label needs an `htmlFor` target:

```tsx
<Select ids={{ trigger: "country" }}>…</Select>
<Label htmlFor="country">Country</Label>
```

## State

Components that own state are controllable: `value` / `defaultValue` / `onValueChange`, `open` / `defaultOpen` / `onOpenChange`. Data-heavy primitives own **only** interaction state (selection, focus, drag) and report every change as an intent; the consumer owns the data.

## Styling

`cn` (clsx + tailwind-merge) and `cva` for variants. State is styled through Ark's data attributes rather than React state. Every stateful part exposes at least `data-state`.

## Keyboard and accessibility

Interactive primitives are fully keyboard operable and announce actions through a visually hidden live region (`LiveRegion` from `live-region`). The reference for each component lists its keys.
