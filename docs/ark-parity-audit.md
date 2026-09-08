# Ark API and polymorphism audit

Checked September 7, 2026 against the installed `@ark-ui/react` version 5.39.1.

## Public API

- Compound UI modules expose component namespace objects (`Card.Root`, `Accordion.ItemTrigger`, etc.). Button is a standalone component with a direct `Button` export and `ButtonProps` type. Flat compatibility exports and callable namespace compatibility are removed. Hooks, helpers, and types remain named exports; compound part props have named type exports.
- The inventory covers all 61 Ark component families. The public-part check verifies 569 Ark parts, including context and root providers. Carousel deliberately retains Embla and uses `Carousel.Root`, `ItemGroup`, `Item`, `PrevTrigger`, and `NextTrigger`.
- Added Ark DatePicker, PinInput, Splitter, Fieldset, Listbox, and Toast. Field and Pagination now use Ark primitives. Added ClientOnly, DownloadTrigger, FocusTrap, Frame, Highlight, Portal, and Presence.
- Resizable, InputOTP, Calendar, and Sonner remain distinct integrations alongside the corresponding Ark alternatives.
- Internal consumers, examples, guides, prop tables, and generated registry files use the namespace API.

## Polymorphism

HTML parts use the Ark factory with ref-preserving prop types. Composite defaults are omitted when a custom child supplies the element. The automated prop audit identifies 1,053 parts that accept `asChild` and explicitly records 21 rendering boundaries in `scripts/polymorphism-exceptions.json`.

These boundaries include providers that compose several elements, text/fragment renderers, and integrations whose libraries own the DOM (such as the iframe, editor, Day Picker, react-resizable-panels, and Sonner). They retain their underlying rendering APIs. This is not a claim that a non-DOM provider or every third-party renderer accepts `asChild`.

Ark 5.39.1's Toast.Root declares `asChild` but hardcodes a div internally. The wrapper uses Ark's root props and factory for custom children while retaining the toast hover bridges.

## Verification

- Public-contract checks verify 1,202 compositional implementation names and named prop exports. Part functions remain private, and no merged TypeScript namespaces are emitted. Type fixtures cover extending HTML props, ref/asChild support, generic row/item types, invalid props, and rejected flat component imports.

- All 124 documentation routes loaded: 116 component pages, seven guides, and the component index. All 114 live previews rendered. Sidebar and App Shell have guides without previews. No Vite error overlay or nested buttons were found in the preview sweep.
- Rechecked interactions for the new and changed APIs: PinInput entry, distribution and backspace; DatePicker day/month/year navigation, selection and clearing; Fieldset disabling nested fields; Listbox filtering and multiple selection; Toast creation and Undo; Pagination first/last boundaries; and Splitter keyboard and pointer resizing (50% to 70%).
- Checked Presence removal/restoration, Portal rendering outside the preview and dismissal, Highlight query changes, FocusTrap initial focus and Tab wrapping, and the Frame's embedded button. Clicked DownloadTrigger's sample-file button; download-file contents were not independently inspected.
- Checked checkbox label clicks, keyboard toggles, disabled state, and a separate Label's input association. Corrected nested labels and retained the original checkbox icons.
- The browser fixture at `/arkcn/api-checks.html` verifies merged parent/child events and refs, a custom Card article, Switch and Accordion RootProviders, Field associations on a custom input, and a keyboard-operated custom Slider thumb.
- Server-rendering tests cover namespace objects, custom tags, merged attributes, composed controls, Field/Fieldset semantics, and TransferList's custom listbox element. Type checks, lint, formatting, Ark coverage, polymorphism checks, and CLI tests pass through `npm run check`.
- `npm run docs:build` succeeds and generates 124 documentation routes. Vite retains its large-chunk advisory. `git diff --check` passes.

The earlier `docs/widget-audit.md` records the broader interaction audit before this API migration. This follow-up adds a fresh preview sweep and focused interaction regressions; it is not exhaustive testing of every prop combination, assistive technology, or browser engine.
