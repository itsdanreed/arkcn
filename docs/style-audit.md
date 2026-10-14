# Styling audit — 2026-10-13

## Reference

The reference is [shadcn/ui at 30a58d4498f270af1c1e981a7d78a15cf5740841](https://github.com/shadcn-ui/ui/tree/30a58d4498f270af1c1e981a7d78a15cf5740841/apps/v4/registry/bases/base/ui),
using its Base UI implementations, Nova recipes, neutral palette, and Geist.
An earlier comparison against an arkcn snapshot was rejected as the wrong baseline. Its results do not count here.

`npm run audit:prepare` downloads the pinned source and expands Nova recipes into utility classes, as the upstream
registry build does. Install the generated reference dependencies with
`npm install --prefix docs/.style-audit --ignore-scripts`, then open `/arkcn/catalog-audit.html` with `npm run docs:dev`.
Generated files are ignored. The reference renders in a separate frame with independent styles and dependencies.
Adapters translate example composition and state callbacks; every styled reference part comes from upstream.

## Audit validity and reference customizations

The reference components are regenerated from the pinned upstream revision. Both audit stylesheets explicitly
turn off automatic Tailwind discovery and declare separate source scopes. The arkcn renderer loads package
styles directly, without the docs page stylesheet. Iframes isolate the rendered CSS; checking the live toolbar
frames showed only `reference.css` on shadcn and `catalog-audit.css` on arkcn.

Run `npm run audit:check` after preparing and before trusting comparisons. It checks generated reference hashes,
file inventory, authored/generated fixture synchronization, prohibited imports, and exact stylesheet import/source
scopes. `node scripts/test-style-audit-integrity.mjs` verifies failures for changed reference files, cross-renderer
source scanning, and indirect arkcn imports. Regeneration is the deliberate way to update the recorded baseline;
the integrity record is not independent proof that every authored fixture is semantically correct.

Each comparison now discloses its reference fixture's component class/style overrides, prop spreads, and wrapper
styles. These include intentional sizing/layout/state composition, but can override defaults or affect inherited
styles. Historical statements that a customized popup, compact input, or navigation row "matches shadcn" only
cover the named shared properties under that composition. They do not establish a match to untouched upstream
defaults. Review the disclosed overrides before extending those conclusions; do not change the reference to
eliminate an arkcn mismatch. The user-approved toolbar spacing remains only on the arkcn side.

Following isolation, 14 Button variant/size groups and five Input states were rechecked against the regenerated
reference in both themes; sampled computed styles matched. The toolbar's deliberate spacing difference remains.
This pass hardens the audit and rechecks representative controls; it does not close the 32 remaining extension
fixtures or the individual interaction gaps listed below.

## Coverage and findings

All 59 direct counterparts were rendered in both themes and their visible geometry/computed styles inspected.
All 57 additional examples were rendered; these have no same-name upstream component and need related-pattern review.
Rendering successfully is not an assertion that every state matches. Some examples have different anatomy or content;
compare visible control parts rather than equating wrappers with the same slot name.

The source and browser comparisons identified and corrected:

- Field labels, invalid/disabled attribute selectors, and compound inputs missing the standalone input recipe.
- Command's initial highlighted item losing its visual selection before focus.
- Menubar checkbox/radio indicators on the wrong edge and destructive icons losing their color on highlight.
- Selected-value alignment in Select, attachment focus styling, and disabled compound label selectors.
- Sonner's missing toast radius and Toast's layout, action/close controls, and missing motion wiring.
- Drawer default handle/header/footer spacing and transition timing.
- Progress label/value layout, including its native implementation.
- Editable, Listbox, and Pin Input missing the shared input styles; several compound inputs missing dark invalid
  or disabled surfaces.
- Slider fill using the raw percentage instead of the thumb's contained position. Keyboard checks at 0, 40, 99,
  and 100 confirm the fill follows the same thumb position as upstream (subpixel rounding below 0.01px remains).

Opened examples inspected include Alert Dialog, Dialog, Drawer, Dropdown Menu, Menubar, Navigation Menu, Popover,
Select, Sheet, Combobox, Toast, and Sonner. Motion styles were inspected for 20 families with reduced motion off;
this is not a frame-by-frame certification of all animations. Regression checks cover compound Field semantics
and shared recipes, and Command's initial selection, alongside the existing state and namespace checks.

## Follow-up: popup behavior and toast motion

Select continues opening below the trigger. This is an intentional user preference (2026-10-13), not a parity defect;
do not replace it with selected-item-over-trigger positioning. Ark's selection and keyboard behavior remain intact.

Toast retains full opacity during entry and front-card exit, travels 150% of its height, and uses the upstream stack height,
scale, and offset calculations. Content behind the front toast is hidden while collapsed and appears on expansion.
The factory defaults to a 12px gap and a 500ms removal delay so the 500ms exit finishes before unmounting; callers
can override these settings. Three collapsed toasts matched reference geometry exactly (98px height, scales 1/0.9/0.8,
and translations 0/-21.8/-43.6px). Keyboard expansion matched the 0/-110/-220px spacing. Keyboard dismissal verified
the closed state, full opacity, exit offset, transition curve, and eventual removal.

The user requested smoother card animation as an intentional deviation from shadcn. Toast content is measured
independently of its container with a ResizeObserver, so card heights animate between pixel values instead of
jumping to/from `auto`. Height uses a 300ms ease-out transition; stack position/scale use 500ms. Live measurements
captured a short card resizing through 118 → 93 → 84 → 78 → 62px during expansion. Mixed-height collapsed and
expanded endpoints match the reference, and the audit's reduced-motion setting disables these transitions.
The Toast audit example now provides persistent short/long notifications and a dismiss-all control for repeatable
checks. The docs' ordinary toast example remains unchanged.

Middle-card dismissal previously slid the outgoing card through its neighbors at full opacity, causing a flash.
Non-front cards now preserve their rendered transform and height while fading out; surviving cards smoothly close
the gap after removal. Browser frame samples verified a fixed -130px position and 62px height throughout dismissal,
decreasing opacity, and the remaining card transitioning from -204px to -130px without stack-state changes.
The regression trace is saved as `toast-middle-dismiss.json` alongside the audit screenshots. Full checks and the
125-route docs build pass after this fix.

Keyboard selection was exercised for Checkbox, Switch, Radio Group, Tabs, Toggle, and Toggle Group in both themes.
Focus comparisons require actual Tab navigation: programmatically focusing Ark's hidden input before sending Space
does not reproduce its keyboard-focus state. Checkbox Tab/Shift-Tab focus rings were verified against the reference.

## Follow-up: expanded control states and composed triggers

Added matched, repeatable fixtures for Checkbox, Switch, Radio Group, Tabs, Slider, Combobox, Context Menu,
Dropdown Menu, and Menubar. The reference fixtures still import only the pinned upstream components. They cover
checked/mixed, invalid, disabled, small switches, line/vertical tabs, single/range/vertical sliders, combobox clear
and custom anchors, and menu selection/destructive/submenu/RTL states.

This pass corrected:

- Combobox's default clear trigger rendered through a Fragment, dropping its Ark action and slot attributes.
  It now clears the value and replaces the chevron, matching the reference input width. Its input and triggers
  inherit root disabled state instead of overriding it with `false`.
- Combobox popup sizing now anchors to the input with upstream's trigger allowance. Default and clear popups
  measure 223px, no-trigger popups 242px, and explicit 256px anchors remain 256px in both implementations.
- Twelve default composed triggers across Combobox, Clipboard, Color Picker, File Upload, Floating Panel,
  Signature Pad, and Tour now forward primitive attributes and caller styles onto their actual Button child.
  Regression rendering checks cover these semantics; browser checks exercised combobox clearing, tour progression
  and closing, and floating-panel maximization and closing.
- Disabled slider thumbs no longer receive a second opacity reduction on top of the disabled parent.
- Sheet backdrop duration now matches the upstream 150ms instead of 100ms.
- Context submenus now use the upstream 144px minimum width and 1px ring instead of a 128px minimum and physical
  border. The tested submenu matches at 144 × 64px. Context submenu alignment is +4px; Dropdown Menu and Menubar
  submenu alignment is -3px, matching the reference. All three submenu chevrons now rotate in RTL.

Both-theme computed-style checks cover the six form-control fixtures; the menu fixtures cover LTR/RTL and dark
destructive keyboard focus. Checkbox and Switch keyboard rings match. Switch sizes and all four Tab orientation/
variant combinations match their corresponding resting states. Slider fill rounding remains below 0.01px.
Ark Tabs activate on arrow navigation while the reference defaults to manual activation; compare selected states
after activation, rather than treating different selected values as a style defect.

Evidence is saved in `expanded-control-states.json` and `expanded-control-states.png` alongside the earlier audit
artifacts. These checks expand state coverage; they do not certify all combinations for all 116 families.

## Follow-up: text controls, grouped buttons, calendars, and tooltips

Added twelve more matched fixture families: Input, Textarea, Button, Button Group, Toggle, Toggle Group,
Input Group, Accordion, Tooltip, Select, Calendar, and Input OTP. Reference fixtures import the pinned upstream
components through the existing composition adapters. Preparation now rejects reference fixture imports of arkcn
components, preventing an accidental comparison of the implementation against itself.

This pass corrected two visible differences:

- Tooltip popup gaps were 5px instead of 4px, and the arrow inset differed. The default gutter now accounts for
  Ark adding half the arrow size. The shared ArrowTip applies the upstream inset for each placement. Popup and
  arrow bounds match exactly for top, bottom, left, and right in both themes.
- Calendar month/year dropdown captions were missing their 24px height and 6px/4px horizontal padding. Those
  dimensions now match upstream; fixed-date fixtures also cover selected days, today, outside days, disabled
  weekends, disabled month navigation, and range endpoints/interiors.

Both-theme measurements found no differences in the tested Input/Textarea empty, filled, invalid, disabled,
and read-only states; Button variants and sizes; Toggle sizes/pressed states; horizontal/vertical Toggle Groups
with joined and spaced items; Input Group addons/textarea layouts; and horizontal/vertical Button Groups with
expanded/disabled buttons, inputs, and separators. Actual hover colors match for all six Button variants in
both themes. Keyboard focus comparisons cover the six initial control families. OTP empty, partial, filled,
invalid, disabled, and active-slot styling match. Select placeholder, selected, invalid, disabled, and small
triggers match; its popup fixture explicitly uses below-trigger positioning on both sides to retain the user's
preference rather than treating that intentional deviation as a defect.

Accordion fixtures record actual animation-frame heights. Both implementations interpolate opening from 0 to
30px and closing to 0 over 200ms with ease-out timing; intermediate samples agree within frame-timing variation.
The reduced-motion fixture produces no animation events. The browser reported OS reduced motion off during
these checks; the OS setting itself has not been changed or validated in its enabled state.

Evidence is saved in `text-controls-and-overlays.json`, `tooltip-four-placements.png`, and
`calendar-state-comparison.png` alongside the previous audit artifacts. Twelve new fixture families plus the
previous nine expand repeatable state coverage to 21 direct families, in addition to the dedicated Toast fixture.
This is still an incremental audit, not certification of every state in the catalog.

## Follow-up: navigation menus and popup placement

Added independent pinned-upstream fixtures for Navigation Menu, Popover, and Hover Card. This brings expanded
fixture coverage to 24 direct families, plus Toast. The motion probe now listens in the document capture phase,
so portaled upstream popups are measured even when their events do not bubble through the fixture.

- Hover Card's default cross-axis offset was missing 4px. After correction, bounds, padding, radius, surface,
  and shadow match for all four requested placements in both themes, including the left/right collision flips.
- Popover needed no recipe change: those same placement and surface measurements match in both themes.
- Navigation Menu's viewport previously shrank to the trigger list and clipped wider content. It now follows
  content width, uses the reference's 8px gap, and aligns with the active trigger. A fallback observer seeds
  dimensions for initially open content. Outgoing content is absolute so it cannot double the viewport height.
- Navigation Menu now uses the reference's 350ms resize easing, 150ms exit, trigger-relative transform origin,
  and panel cross-fade. Its explicit viewport transition prevents Ark from cancelling an active
  resize when previousValue clears. Focus backgrounds apply to pointer and keyboard focus as in the reference.

Browser frames confirm continuous viewport movement and resizing without the old intermediate height spike or
mid-resize cancellation. Both themes reach 328×140px and 232×100px for the two panels. Reduced-motion fixtures
produce no animation/transition traces. OS reduced-motion rules are supplied for the content and viewport but
were not exercised by changing the system setting.

The initial pass left fractional positioning and motion synchronization open; the follow-up below addresses
those issues. The reference's disabled trigger renders with aria-disabled instead of native disabled, so its
native :disabled opacity recipe does not activate; arkcn retains visible dimming.

Evidence: `popup-navigation-states.json` and `navigation-menu-comparison.png` in the existing local audit artifact
directory. Native porting remains paused.

## Follow-up: synchronized navigation and cursor collisions

Navigation Menu now measures viewport position and size together, preserving fractional trigger coordinates.
Both panel endpoints match the reference exactly, including x=166.953125px for the second panel. The motion
probe samples all related elements in one animation-frame sequence rather than restarting whenever another
CSS property begins transitioning. This exposed two additional problems: content disappeared at the start of
closing, and hidden content could reset the measured size to zero before reopening. Both are corrected.

Actual upstream browser traces show cross-fading panels without lateral translation. The directional slide
added in the previous pass was therefore removed. Entry samples show matching popup/content opacity and scale
curves within frame-sampling variation; closing retains the content fade while the popup scales/fades over
150ms. Switching uses the same 350ms easing for position, size, and opacity. Reduced-motion fixtures generate
no animation or transition traces. Escape on an initially open trigger now closes the panel even if the initial
portal preceded Ark's dismissable-layer registration.

Context Menu now has a dedicated default cursor-positioning path using Floating UI. Ark still owns menu state,
focus, selection, long-press detection, and submenus. The default path keeps the 4px alignment offset, reverses
that offset on bottom alignment, preserves full collision shifting, accounts for upstream's 1px preferred-side
bias, and matches its transform origins. An explicit `positioning` prop continues through Ark's configurable
positioner. `@floating-ui/dom` is declared as an optional peer and included in the Context Menu registry item.

Matched fixtures cover LTR, RTL, all four viewport corners, a menu taller than the viewport, and keyboard
submenu opening. Corner bounds and origins match exactly. The tall menu is constrained to 628px height at y=5
in the 638px iframe viewport. Central LTR clicks land at x=160 in the reference and x=159 in arkcn because the
browser rounds the two iframe locations differently; measured menu offsets relative to those recorded cursor
coordinates match, as do submenu offsets relative to their parents. This is input-coordinate variation, not
an unaccounted style offset.

Evidence is saved in `cursor-navigation-motion.json` and `context-menu-collision-comparison.png`. This closes
the two specific positioning/motion issues above; it does not certify untested combinations across the catalog.

## Follow-up: dialog variants and directional overlays

Added independent upstream fixtures for Dialog, Alert Dialog, Sheet, and Drawer, bringing expanded fixture
coverage to 28 direct families plus Toast. Dialog covers the optional close button; Alert Dialog covers both
sizes with and without media; Sheet and Drawer cover all four directions, including Drawer swipe handles.

Dialog and Alert Dialog needed no recipe changes in these cases. Their panel, header, description, footer,
button, and icon geometry and surface styles match the pinned reference. This includes narrow-screen stacked
footers and Alert Dialog media placement. Their 100ms entry/exit animations were captured, and keyboard focus
rings and Escape dismissal were checked.

Sheet had two motion discrepancies that resting screenshots did not reveal. The numeric `slide-*-10` utility
resolved to a percentage of the panel size, whereas upstream uses 2.5rem. Explicit 2.5rem slide distances now
match on horizontal and vertical panels. The backdrop also now uses the reference's ease-in-out curve rather
than the animation utility's default ease. The panel retains its 200ms duration and the backdrop its 150ms
fade. The motion probe now continues recording surviving related elements after the backdrop unmounts, so it
captures the entire panel exit.

Drawer's optional handle now occupies a 12px strip on every edge with a 96×4px indicator (rotated on side
panels). The old bottom handle made the panel 8px too tall and the other directions had no handle. A flex body
keeps header/footer content together beside horizontal handles; header/footer no longer shrink, and the
description uses the reference's balanced wrapping. In the desktop fixture, bottom/top panels now measure
163px high, and side panels measure 384px wide, with matching child bounds. Entry moves by the full panel
size plus 2px over 450ms; exit uses `--drawer-swipe-strength * 400ms`. The backdrop also follows Ark's swipe
progress variable. Custom inset and asChild APIs remain available.

Browser checks cover both themes, all four directions, narrow-screen variants, keyboard focus, Escape, and
entry/exit frames. CSS animation-start and transition-run events sample at different points in the first
refresh interval; compare corresponding progress, not identical trace indices. Reduced-motion fixtures emit
no motion traces. This does not certify Drawer drag/release physics, snap points, nested stacks, inset edge
clearance, or operating-system reduced motion; those remain separate coverage gaps.

`npm run check`, `npm run docs:build` (125 routes), and `git diff --check` pass. Evidence is saved in
`overlay-states-motion.json` and `drawer-direction-comparison.png` in the existing local audit artifact directory.

## Follow-up: commands, fields, labels, progress, and pagination

Added independent reference fixtures for five more direct families, bringing expanded state coverage to 33
families plus Toast. Fixtures cover command filtering/empty/disabled/checked states and its dialog, three Field
orientations with disabled and invalid inputs, error deduplication, textarea errors, standalone group/peer labels,
progress endpoints and changes, and pagination selection/boundaries in LTR and RTL.

- Command Dialog now sits at one-third of the viewport height, matching upstream, rather than being vertically
  centered. Empty command groups no longer leave headings and 36px of empty group space below the no-results
  message. Clearing a query restores the first-result highlight after Ark's empty-input microtask; the next
  Arrow Down now highlights the same second item as cmdk. The reset respects `autoHighlight={false}` and cancels
  pending work on later input or unmount.
- Field labels now center their inline icons and use the reference's text-selection behavior. Browser measurements
  showed that Field Title already had the correct rendered line height; it remains unchanged. Vertical, horizontal,
  and responsive fields match at desktop and narrow widths, including invalid/disabled controls and error lists.
- The docs now use the package's existing Geist/sans-serif fallback. Its previous system-font override changed
  shortcut glyph widths (including the Command symbol) relative to the reference.
- Pagination's stateful buttons now reuse the shared Button recipes: medium text weight, transparent border space,
  complete selected surfaces, hover/focus states, and disabled styling. Root spacing is 2px instead of 4px, and
  previous/next link arrows rotate in RTL. Ellipses no longer receive interactive hover/focus styling.
- Label and Progress needed no component recipe changes in the tested cases. Progress width traces interpolate
  from 96px to 288px over 150ms with the same easing; small per-frame differences follow sampling timestamps.

Both-theme comparisons match after fixes, including Command's empty panel and dialog, Pagination page-one
boundary controls, and Field layouts. Keyboard focus borders/rings match; a hovered control can retain its hover
background while also showing keyboard focus, so pointer placement must be accounted for in screenshots.
Narrow-layout checks cover Field and Pagination. These are additional state checks, not a claim that every
combination in the catalog is finished.

Evidence: `form-selection-audit.json`, `command-keyboard-fixed.json`, `command-dialog-comparison.png`, and
`pagination-state-comparison.png` in the existing local audit artifact directory. Earlier before-fix samples in
the same evidence set document the identified differences. Native porting remains paused.

## Follow-up: carousel, collapsible, resizing, and scrolling

Added independent reference fixtures for four more direct families, bringing expanded fixture coverage to 37
families plus Toast. This count includes the unresolved Scroll Area initialization issue below; it is not a parity
completion count. Both themes were compared against the same pinned upstream source.

- Carousel default arrows now rotate in RTL, matching shadcn. Horizontal and vertical layouts, LTR/RTL arrows,
  first/last disabled controls, and slide motion were exercised. Both implementations use Embla: the horizontal
  first advance settles at ±272px, and vertical at -160px. Recorded traces have the same 104/100 sample counts
  and approximately 1716/1650ms settling durations, with normal sampling-time variation.
- Collapsible now exposes `aria-disabled` from the Ark context. Ark already blocks activation, but its trigger
  previously lacked the disabled accessibility state. Enter opens and Space closes the enabled panel; the disabled
  panel stays closed. Open-panel geometry and recipes match in both themes. Neither default content recipe adds
  an open/close animation.
- Resizable matches without a production recipe change. The fixture supplies a fixed-height parent because the
  primitive sets the group height to 100%. Keyboard adjustment moves 40% to 45%; Home/End respect 20%/80% panel
  constraints. Focus rings were inspected with the relevant frame focused; comparing two frames simultaneously
  otherwise reports the expected active-frame-only focus difference.
- Scroll Area matches for short content and single-axis overflow. Two-axis tracks, colors, corner dimensions, and
  settled scroll endpoints match, but initial thumb measurement does not. In the 222×190px viewport with 384×684px
  content, arkcn initially renders a 127.1875px horizontal thumb versus 122.5625px upstream. Ark measures before
  applying its 10px corner. After scrolling, both measure 122.5625px. The reference itself changes its vertical
  thumb from 50px to 52.21875px on the first scroll; arkcn starts at 52.21875px. This is a primitive measurement
  issue, not a utility-class mismatch. No synthetic scroll event or fixed-size thumb workaround was introduced.
  Initial two-axis sizing remains open.

The audit's reduced-motion toggle changes CSS; it does not disable Embla's JavaScript motion. Both implementations
still recorded 104 samples with that toggle enabled. Operating-system reduced motion and an intentional accessible
motion policy need separate verification; these traces must not be presented as reduced-motion compliance.

Evidence: `layout-controls-audit.json` and `carousel-direction-comparison.png` in the existing local audit artifact
directory. `npm run check`, `npm run docs:build` (125 routes), and `git diff --check` pass.
The JSON retains before-fix and exploratory samples; the `resizable-bounded-keyboard-dark` and later
samples supersede the original unbounded resize fixture. Native porting remains paused.

## Follow-up: motion preferences, scroll measurement, and display controls

Expanded fixtures now cover 41 direct families plus Toast. Four new comparisons cover Avatar, Badge, Alert, and
Separator in both themes. Avatar includes loaded/broken images, all three sizes, status badges, overlapping groups,
and text/icon group counts. Badge covers six variants, inline icons, links, invalid states, hover, and keyboard focus.
Alert covers both variants, with/without icons, action positioning, links, and multi-paragraph descriptions. Separator
covers both orientations and custom dimensions/colors. The tested rendered geometry and recipes match upstream.

Avatar RootProvider now accepts and emits the same `size`/`data-size` as Root. Previously it lacked the default
attribute needed by badge sizing and could not apply small/large fallback and group styles. A provider-composed
avatar now matches the ordinary upstream avatar at every size. Regression checks compare both compositions.

The prior Scroll Area horizontal initialization gap is fixed. The exported hook uses the same Zag machine and
connection as Ark, with an additional watch on corner width/height. A corner change sends `thumb.measure` after
React commits the new track geometry. Root uses that hook through Ark's RootProvider; consumers of the exported
hook receive the same correction. The two Zag packages are declared optional peers and development dependencies,
and registry generation records them. No DOM scroll event is fabricated and scroll position is not changed.
The horizontal thumb is now 122.5625px initially and after removing/restoring horizontal overflow. The reference's
vertical thumb still starts at 50px and changes to 52.21875px on scrolling; arkcn keeps its stable 52.21875px geometry.
That upstream initialization quirk is recorded rather than reproduced. Custom external Ark hooks passed into
RootProvider retain their own machine behavior.

Carousel now adds Embla's [documented reduced-motion breakpoint](https://www.embla-carousel.com/docs/v8/api/options#breakpoints)
with `duration: 0`. The preference entry is last even when callers supply their own breakpoint map, preserving
other options while giving the motion preference precedence. Button/keyboard/API navigation reaches the slide
endpoint immediately under the preference. Normal motion still matches the reference's 104-sample trace. Cleanup
now removes both selection and reinitialization listeners. This does not claim that Embla drag-release inertia or
third-party autoplay plugins honor the preference; those are separate behavior checks.

The audit toggle now explicitly says “Reduced motion (simulated)”. Both isolated frames receive the same simulated
`matchMedia` preference in addition to the existing CSS override. This fixture-only setup leaves OS settings unchanged
and keeps the upstream reference implementation intact: the pinned shadcn carousel continues animating, while arkcn
reaches ±272px horizontally and -160px vertically without intermediate scroll samples. Native OS preference changes
have not been exercised; the media-query path was tested in the fixture.

Evidence: `motion-scroll-avatar-badge-audit.json` and `avatar-states-comparison.png` in the existing local audit
artifact directory. `npm run check`, `npm run docs:build` (125 routes), and `git diff --check` pass.
The JSON includes exploratory immediate samples during scrollbar visibility updates; they are
not settled-state parity assertions.

Still awaiting expanded fixtures: Aspect Ratio, Attachment, Breadcrumb, Bubble, Card, Chart, Direction, Empty, Item,
Kbd, Marker, Message, Sidebar, Skeleton, Sonner, Spinner, and Table. Existing default snapshots and earlier individual
checks do not cover all states. The 57 extensions also retain their related-pattern coverage gaps. Native porting
remains paused.

## Follow-up: cards, items, empty states, breadcrumbs, keycaps, and loading

Expanded fixtures now cover 48 direct families plus Toast. Seven new reference fixtures exercise Card's two sizes,
header action/border, optional image/footer; Item's three sizes/variants, icon/image media, grouped separators and
header/footer; both Empty media variants; LTR/RTL Breadcrumb with default/custom separators; Kbd groups and tooltip
surfaces; and Skeleton/Spinner dimensions, composition, and motion.

Corrections found through rendered comparisons:

- Small Card titles now preserve their snug line height when the font size changes. They were 20px high versus
  19.25px upstream, shifting the description, content, and footer. The size variant now sets `text-sm/snug`.
- Extra-small Item descriptions preserve normal line height: 18px at 12px type, matching upstream, instead of 16px.
  This fixes item heights and the accumulating vertical offset in groups.
- Default Breadcrumb chevrons now rotate 180 degrees in RTL. Custom separators remain as supplied.
- Skeleton's pulse was using the control transition curve `(0.4, 0, 0.2, 1)` instead of upstream's symmetric
  `(0.4, 0, 0.6, 1)`. A distinct shared `pulseEasing` token now drives generated web CSS and the existing native
  Skeleton. Standard control easing remains unchanged. The native regression test checks the dedicated pulse curve;
  no new native components were ported and no fresh device motion certification was performed.

Both-theme computed geometry matches after these fixes. Narrow-width checks cover Card, Item, Empty, and Breadcrumb.
Item/Breadcrumb link hover and keyboard focus, and Empty description-link hover match the reference. Empty and Kbd
needed no component recipe changes. Spinner already matches the reference's 1000ms linear full rotation.

The audit motion observer now handles SVG as well as HTML elements and records keyframes/timing alongside frame
samples. Skeleton's corrected 2000ms pulse matches the upstream keyframes and easing over a full cycle (opacity
1 → 0.5 → 1). Spinner's rotation keyframes and duration match over more than one cycle. Both loading controls are
static with the audit's reduced-motion toggle enabled; this includes the fixture CSS override and is not a claim
that the upstream reference independently honors OS reduced motion.

`npm run check`, `npm run docs:build` (125 routes), and `git diff --check` pass. Evidence is saved in
`display-loading-audit.json` and `card-states-comparison.png` in the existing local audit artifact directory. The JSON
retains initial mismatches alongside the corrected comparisons and animation traces.

Ten direct families still need expanded fixtures: Aspect Ratio, Attachment, Bubble, Chart, Direction, Marker,
Message, Sidebar, Sonner, and Table. Gesture/device gaps and the 57 extensions' related-pattern checks remain open.
Native porting remains paused.

## Follow-up: tables, charts, sidebar, and Sonner

Expanded fixtures now cover 52 direct families plus Toast. These four new comparisons use the same pinned upstream
Nova components, not arkcn recipes on the reference side.

Corrections found through rendered comparisons:

- Table checkbox cells now recognize Ark's checkbox root as well as explicit checkbox roles. Their right padding
  is removed, and direct checkbox roots use flex layout to avoid inline baseline space. Previously the selected
  row was 40px tall versus 37px upstream, and the extra cell padding shifted all columns. Header, body, caption,
  footer, selected and expanded-row geometry now match in both themes and at the tested narrow width.
- Chart dashed tooltip indicators now use their series color, rather than the generic border token. The color is
  applied inline because the canonical-class lint rule incorrectly simplifies `border-(--color-border)` to
  `border-border`. Tooltip and legend corners explicitly use the upstream 2px radius. Dot, line, dashed, nested
  labels, hidden labels/indicators, and legends match in both themes; a keyboard-selected bar tooltip and narrow
  layouts also match. Bar data animations are disabled in these fixtures, so this does not certify data-transition
  motion or every Recharts chart type.
- Sidebar submenus no longer add 4px top/bottom margins that shifted subsequent items by 8px. The toggle icon now
  rotates 180 degrees in RTL. Checks cover default, floating, and inset layouts; left/right placement; RTL; active,
  disabled, outlined, and sized menu items; icon/offcanvas collapse; and the noncollapsible layout. Desktop collapse
  matches upstream's 200ms linear transition from 256px to 48px, including intermediate frame samples. The mobile
  sheet geometry and dismissal were checked at an iframe width below 768px, with focus compared independently.
- Sonner needed no production styling changes. Success, info, warning, error, loading, action/cancel, expanded and
  stacked cards match in both themes and at narrow width. Expansion and middle-card dismissal use the same 400ms
  `ease` transitions as upstream, with frame samples retained. Action and cancel dismiss their cards. The audit
  fixture owns its Toaster, so the catalogue's fallback Toaster is suppressed to avoid duplicate portals.

Reduced-motion checks use the audit's simulated media query and CSS override; they do not certify device settings.
Sidebar skeleton/random-width and hover-triggered tooltip states, Sonner gestures/promise updates, and Chart custom
formatter/icon and data-transition cases remain outside this batch. Raw evidence retains initial mismatches,
sequential-focus/hover artifacts, and corrected comparisons; loading spinner bounding boxes differ between
unsynchronized normal-motion samples because the icons are at different rotation phases.

`npm run check`, `npm run docs:build` (125 routes), and `git diff --check` pass. Browser evidence is saved in
`data-navigation-audit.json`, `chart-indicators-comparison.png`, and `sonner-expanded-comparison.png` in the existing
local audit artifact directory.

Six direct families still need expanded fixtures: Aspect Ratio, Attachment, Bubble, Direction, Marker, and Message.
The 57 extensions' related-pattern checks and the existing gesture/device gaps remain open. Native porting stays
paused.

## Follow-up: final six direct counterparts

Expanded fixtures now cover all 59 direct counterparts (58 families plus Toast). This is a fixture-coverage milestone,
not a claim that every state, gesture, composition, or device has exact parity. The six additions are Aspect Ratio,
Attachment, Bubble, Direction, Marker, and Message, using the pinned upstream implementations on the reference side.

Aspect Ratio needed a production fix. Its percentage-padding wrapper computed height from the parent's width even
when the content element had a narrower width: the 160px-wide, 16:9 case was about 201.8px tall versus 90px upstream.
It also kept a fixed box when intrinsic content needed more height (269.1px versus 282px in the tall-content case).
The root now uses `relative aspect-(--ratio)` on the rendered element, matching the upstream CSS layout. The default
1:1 ratio, custom styles, and Ark `asChild` API remain supported. The extra `aspect-ratio-wrapper` element is removed;
consumers targeting that internal wrapper will need to target the root. Four ratios, borders, constrained widths,
and tall content match in both themes and at narrow width.

The other five families needed no production recipe changes in this batch:

- Attachment: default/sm/xs sizes; idle/uploading/processing/error/done states; horizontal groups and vertical image
  cards; trigger focus/hover surfaces and shimmer colors. The upload shimmer matches the reference's 2000ms linear
  background-position animation and keyframes, with more than one cycle recorded. Image opacity and group overflow
  geometry also match. Group touch scrolling/snap gestures were not exercised.
- Bubble: all seven variants, start/end alignment, wrapping, top/bottom and start/end reaction placement, interactive
  hover and verified keyboard focus rings. Early sequential samples with pointer/focus interference are retained
  alongside corrected comparisons with the pointer outside both frames.
- Message: LTR/RTL, start/end placement, avatars, headers/footers, ghost and secondary bubbles, and the composition
  without a header/footer. Geometry and typography match at both tested widths.
- Marker: all three variants, icons, wrapping, links, hover styling, and the separator's before/after rules. Pseudo-
  element dimensions, margins, and colors were compared separately from ordinary element geometry.
- Direction: default direction, nested providers, runtime RTL/LTR switching, and breadcrumb chevrons. The fixture
  explicitly reads `useDirection` and applies `dir` to its DOM scope; it does not claim automatic global direction
  propagation into every Ark primitive.

All six families match the sampled computed styles in light/dark themes and the light-theme narrow-width pass.
The reduced-motion fixture disables shimmer via its simulated media query/CSS override; OS and device settings
were not independently exercised. Evidence is saved in `final-direct-families-audit.json` and
`aspect-ratio-comparison.png` in the existing local audit artifact directory.

`npm run check`, `npm run docs:build` (125 routes), and `git diff --check` pass. The remaining work is the documented
state/gesture gaps and systematic related-pattern checks for the 57 extensions without a direct upstream component.
Native porting remains paused until that audit work is resolved.

## Extension pass: number input, password input, and editable

Three extensions now have independent related-pattern fixtures. The catalogue keeps the 59 direct counterparts
separate from these comparisons, labels the reference as a related pattern, and links to the actual upstream
Input or Input Group source rather than a nonexistent same-name file. Reference fixtures import only the pinned
upstream components. This is a comparison of shared visual parts, not identical component behavior.

- Number Input is compared to shadcn Input + Label. Label line height is corrected from 20px to 14px, removing a
  6px vertical offset per field. Default, disabled, invalid, read-only, empty, and focused surfaces match in light
  and dark themes; narrow input typography also matches. The Ark stepper is retained as an extension. Incrementing
  and the maximum-value/read-only disabled triggers were exercised; scrubber dragging, locale formatting, and
  press-and-hold repetition are not covered by this batch.
- Password Input is compared to Input Group + Label + its icon button. The label line height, input height and
  padding, trailing button placement, 7px button radius, 16px icons, disabled content opacity, and dark invalid
  border now match. The trigger reuses the shared button base/size recipes but omits the ghost variant's
  `aria-expanded` surface: revealing text is not an open popup. The input focus ring no longer lights up the whole
  control when only the trigger is focused. Invalid styling now wins over focused styling. The default reveal
  icons were reversed; hidden text now shows Eye (Show password), and visible text shows EyeOff (Hide password).
  Both-theme and narrow geometry, normal/invalid input focus, trigger focus, and reveal/hide states were checked.
  Normal motion recipes match: 150ms with `(0.4, 0, 0.2, 1)` easing for the surface and button. No new frame trace
  was recorded for these color transitions. Ark's read-only and trigger keyboard behavior remain unchanged and
  are not claimed equivalent to the simple reference fixture.
- Editable is compared to Input + Label while editing. Its label line height is corrected and the active input
  matches in both themes and at narrow width. The disabled preview no longer takes pointer hover styling, and
  focusable previews get the shared focus ring. Escape restores the prior value; Enter commits the edited value.
  Preview presentation remains an extension, not a direct shadcn control. Other activation modes and custom edit
  triggers still need coverage.

The linter also canonicalized equivalent `text-sm leading-none` classes to `text-sm/none` in Label, Switch,
Checkbox, and Radio Group; these four substitutions do not change the computed styles.

`npm run check`, `npm run docs:build` (125 routes), and `git diff --check` pass. Evidence is retained in
`extension-input-audit.json` and `password-input-related-pattern.png` in the local audit artifact directory.

54 extensions still need related-pattern fixtures. Tags Input and the remaining compound form controls are next;
the documented direct-component state/gesture gaps remain open. Native porting stays paused.

## Extension pass: tags input, segment group, and pin input

Added independent related-pattern fixtures for three more extensions. The comparator now reports 59 direct
counterparts and six related-pattern comparisons. These references use pinned shadcn Combobox chips, Tabs, and
Input + Label, rather than copies of arkcn styles.

- Tags Input: corrected label line height, populated/empty control padding, input spacing, and the remove button's
  24px target, 8px radius, negative margin, hover/focus treatment, and transition recipe. Removed double dimming
  of disabled tag text. Focus-within now lights the control for pointer and keyboard input, with invalid styling
  taking precedence. Light/dark measurements match for enabled, empty, invalid, and wrapping examples at wide and
  narrow widths. Adding a tag with Enter, editing by double-click and Enter, and deleting the edited tag work.
  Keyboard tag highlighting remains an Ark affordance. The disabled control retains arkcn's input-style dimming
  and background; the pinned Combobox chips do not dim their container. Clear-all, paste, read-only, and RTL tags
  still need coverage.
- Segment Group: removed the invisible ItemControl's contribution to flex spacing; matched tab-list dimensions,
  item borders/heights, vertical alignment, disabled opacity, and dark text colors. Added the reference focus
  border/ring/outline. Kept radio semantics and the moving indicator. The old duration utility was overridden by
  Ark's inline transition; the indicator now uses Ark's CSS variables for 150ms and `(0.4, 0, 0.2, 1)` easing.
  Horizontal and vertical frame traces confirm intermediate motion, and the simulated reduced-motion fixture
  snaps to the selected position. Added an important reduced-motion override so the media rule can override
  Ark's inline transition. Arrow navigation and RTL selection were exercised. **A precision gap was found (fixed in the follow-up below):** Zag
  measures with integer `offsetLeft/Top/Width/Height`; the selected indicator can differ by roughly half a CSS
  pixel from fractional item bounds. Its separate painted surface also differs from a tab's combined focus and
  selected surface. These are not certified as exact parity. RootProvider, custom icons, and OS-level reduced
  motion still need dedicated coverage.
- Pin Input: fixed a composition bug where Input.Root's width/padding classes overrode the digit classes passed
  to its child. Classes now merge on Input.Root, restoring 32px cells instead of stretching across the control.
  Corrected label line height and disabled label treatment. Light/dark, narrow, disabled, empty, masked, invalid,
  and normal/invalid focus measurements match the independent Input + Label fixture. Keyboard entry advances
  through the cells. Paste, autofill, and completion callbacks are not covered by this visual pass.

Validation: `npm run check`, `npm run docs:build` (125 routes), and `git diff --check` pass. The docs build retains
its existing large-chunk advisory. Local evidence: `compound-controls-audit.json` and `pin-input-related-pattern.png`.

51 extensions still need related-pattern fixtures. The precision issue above and earlier state/gesture gaps remain;
native porting stays paused.

## Extension pass: clipboard, fieldset, and segment precision follow-up

The comparator now has 59 direct counterparts and eight independent related-pattern comparisons. Clipboard uses
pinned shadcn Input + Label + an outline icon button. Fieldset uses the actual FieldSet, FieldLegend,
FieldDescription, and FieldError components from the pinned Field source.

- Clipboard now composes the shared Input, restoring disabled/invalid styling, padding, responsive font size,
  normal read-only text color, and color transitions. Its label now uses the reference line height. Dark desktop
  and both-theme narrow measurements match, including input focus, invalid focus, and the copy button's focus
  treatment. Clicking Copy shows the same Check icon and unchanged geometry on both sides, then resets to Copy.
  Clipboard permission failure handling and ValueText/custom-trigger compositions remain outside this pass.
- Fieldset now uses the reference's 16px legend and bottom margin, helper text line height/spacing, and underlined
  helper links. Disabled legends follow the reference's normal opacity while nested native inputs remain disabled.
  Direct radio/checkbox-group spacing rules also match the FieldSet recipe. Default, disabled, and invalid examples
  match in both themes and at narrow width. Custom legend layouts and direct grouped-control spacing still need
  dedicated browser fixtures.
- Segment Group's indicator now measures fractional bounds rather than painting Zag's rounded offset sizes.
  The measurement preserves the primitive's visibility and transition lifecycle, accounts for borders, scrolling,
  and axis-aligned scale, and observes both the root and sibling items so label changes can reposition the indicator.
  Caller style overrides still win. Horizontal, vertical, RTL, 110% scaled, and RootProvider examples all have zero
  measured difference between the selected item and settled indicator bounds. Resizing an earlier sibling's label
  also leaves zero difference. Horizontal and vertical traces retain smooth 150ms `(0.4, 0, 0.2, 1)` motion; the
  reduced-motion fixture settles at the same precise position. Rotation/skew transforms are not supported by this
  bounds calculation. The separate moving surface versus shadcn's per-tab selected surface remains a behavioral
  distinction; custom icons and OS-level reduced motion still need coverage.

`npm run check`, `npm run docs:build` (125 routes), and `git diff --check` pass. The existing docs chunk-size advisory
remains. Evidence: `fieldset-clipboard-audit.json` and `fieldset-related-pattern.png` in the local audit directory.

49 extensions remain without related-pattern fixtures. Continue with the remaining compound controls, then close
the documented state/gesture gaps before resuming native porting.

## Extension pass: listbox and popconfirm

The comparator now has 59 direct counterparts and ten independent related-pattern comparisons. Listbox uses
pinned shadcn Command, CommandList, CommandGroup, CommandItem, CommandEmpty, Input, and Label. Popconfirm uses
pinned shadcn Popover and small confirmation buttons; it is an anchored confirmation, not an Alert Dialog clone.

- Listbox now matches the reference shell radius, group padding, item gap, keyboard highlight, disabled opacity,
  16px check indicator, label line height, and empty-state spacing. Its input now composes Input.Root without
  losing caller classes. Both-theme keyboard-highlight measurements and the filtered empty state have no sampled
  style/geometry differences. Arrow navigation skips the disabled item and Enter selects the highlighted item.
  Ark multi-selection remains distinct from Command's active item: Command initially highlights its first item,
  while Ark does not. Long scrolling, multiple groups, RTL, root-disabled/invalid compositions, and ValueText still
  need dedicated coverage. The filter input's accessible name remains a consumer responsibility.
- Popconfirm now inherits Popover's padding, spacing, title weight, and description typography. Collision padding
  aligns with the reference at the viewport edge. Both-theme/narrow sampled popup and button geometry/styles
  match. Cancel and Confirm expose distinct accessible names without duplicate close-trigger IDs. A prevented
  confirmation stays open; a subsequent successful confirmation closes. Lazy-mounted title/description IDs are
  connected to the alertdialog once their portal mounts.
- Removed the shared Popover's unintended transform-origin transition. The corrected Popconfirm entrance has
  the same 100ms animation timing and keyframes as the reference, without sideways origin drift. Exit keyframes
  and timing match; Ark retains its existing forwards fill until presence unmounts, whereas Base UI uses no fill.
  Custom arrows/icons, controlled/asChild permutations, collision directions, and OS-level reduced motion still
  need dedicated coverage.

Validation: `npm run check`, `npm run docs:build` (125 routes), and `git diff --check` pass. The existing docs
chunk-size advisory remains. Local evidence: `listbox-popconfirm-audit.json` and `popconfirm-related-pattern.png`.

47 extensions remain without related-pattern fixtures. Native porting stays paused while these and the documented
state/gesture gaps are addressed.

## Extension pass: date input and download trigger

The comparator now has 59 direct counterparts and twelve independent related-pattern comparisons.

- Date Input uses pinned shadcn Input + Label for the field shell and label. Corrected label line height,
  vertical padding, and responsive font size (16px below the medium breakpoint, 14px above). Default, empty,
  disabled, invalid, and read-only shell/label measurements match in both themes and desktop/narrow layouts.
  Normal dark focus and invalid light focus also match. Both use 150ms color transitions with the same easing.
  Keyboard month entry advances to the day, and read-only month values resist ArrowUp. Ark's separately focusable
  segments retain their padding, tabular digits, and selected-segment colors; these are not the same rendering as
  shadcn's plain text input. Range/time/locale/RTL variations, bounds, validation callbacks, and RootProvider still
  need coverage.
- Download Trigger uses pinned shadcn Button. Its default outline, disabled, invalid, and custom small secondary
  asChild button already match the sampled geometry and styles; no component styling change was required. Normal
  focus and invalid focus match, as do the 150ms transition settings. Both themes and narrow/desktop layouts were
  sampled. The in-app browser did not report a completed download after clicking the generated-text fixture, so
  file delivery is unverified. Async data, failures, and cancellation remain outside this pass.
- Fixed the audit page's theme toggle to update its surrounding page as well as its comparison frames.

Validation: `npm run check`, `npm run docs:build` (125 routes), and `git diff --check` pass. The existing docs
chunk-size advisory remains. Local evidence: `date-input-audit.json`, `download-trigger-audit.json`, and
`date-input-related-pattern.png`.

45 extensions remain without related-pattern fixtures. Native porting remains paused.

## Extension pass: date picker

The comparator now has 59 direct counterparts and thirteen independent related-pattern comparisons. Date Picker
uses the pinned shadcn Calendar, Input Group, Label, and Popover with matching date values and disabled dates.

- Corrected the label line height, calendar shell size/padding/ring, navigation icon size, caption layout,
  weekday typography, day sizing/spacing, today surface, outside-date colors, and disabled opacity. The tested
  day grid is 212px wide including its shell, with 28px day cells. Every sampled weekday/day geometry and style
  matches the reference in light/dark and the narrow layout. Default, empty, disabled, and invalid input-group
  examples also match at rest. The popup's internal 8px padding lives on Content rather than a nested Calendar.
- Clear now exposes disabled state when the picker is disabled or read-only. Selecting October 20 updates the
  input and closes both popups; clearing removes the value, button, and its addon space. Disabled Clear is not
  enabled. Read-only Clear is implemented but has not received a separate browser fixture.
- Added the reference's 100ms fade/scale/slide entrance and fade/scale exit. Entrance timing/keyframes match;
  exit keyframes/timing match, with Ark's forwards fill retained until unmount. Escape dismissal traces reach
  removal without returning to an opaque frame. The reference additionally transitions its focused outline.
  Simulated reduced motion reports no animation on either popup; OS-level reduced motion remains untested.
- Table columns now control row layout consistently, including incomplete final rows. The month/year fixtures
  and docs explicitly specify three columns. A final single year stays one column wide. Month and year cells
  retain 32px height; switching year → month → day works. These views are Ark extensions, not shadcn equivalents.

Remaining distinctions: Ark anchors to the field with its own placement/gutter, while the reference Popover
anchors to the calendar button. Ark prevents navigating before its minimum date; the reference disables those
individual dates but still allows navigation into that month. Keyboard focus recipes match visually, but the
pinned Calendar's day-button ref is not attached, producing different actual-focus versus focused-day behavior;
this pass does not certify keyboard parity. Range/multiple selection, week numbers, locales/RTL, dropdown month/
year selects, custom compositions, and collision directions still require dedicated comparisons. Ghost Button's
existing expanded style was rechecked against the pinned Nova source and retained unchanged.

Validation: `npm run check`, `npm run docs:build` (125 routes), and `git diff --check` pass. The existing docs
chunk-size advisory remains. Evidence: `date-picker-audit.json` and `date-picker-related-pattern.png`.

44 extensions remain without related-pattern fixtures; native porting stays paused.

## Extension pass: file upload

The comparator now has 59 direct counterparts and fourteen independent related-pattern comparisons. File Upload
uses pinned shadcn Attachment rows, Label, small outline/ghost buttons, and an outline Button containing Empty's
header/media/description as the drop-area presentation. This is an authored compound pattern, not a same-name
upstream upload component. The reference never imports arkcn components or their classes.

- Corrected label line height and aligned the default drop area with the Button + Empty presentation, including
  icon container, description, padding, invalid/focus rings, and disabled/read-only opacity. Consumer-supplied
  dropzone children remain supported. The public docs example now demonstrates this default content.
- File rows now use the Attachment surface, radius, spacing, icon dimensions/color, typography, and small remove
  action. Explicit grid placement fixes the remove button falling onto a later row. A minmax(0,1fr) filename
  column preserves truncation without pushing the action outside the row. Filename/size alignment and 58px row
  height match the reference in the sampled cases.
- Default, disabled, invalid, and read-only examples have no sampled geometry/style differences in both themes,
  at desktop width and a 700px comparison viewport. Drop-area focus, remove-button focus (including the row's
  focus-within ring), and invalid narrow-layout focus match. Disabled and read-only delete/clear controls are
  unavailable. Both patterns use matching 150ms transitions; simulated reduced motion sets duration to zero.
- Browse successfully added a local generated text fixture through the file chooser. Removing that file, deleting
  the first existing row, and clearing the list behaved correctly. Clear disappears when the list is empty. This
  tests local file selection, not transmission to a server; File Upload itself does not perform that transmission.

Outstanding: real drag/drop and dragging styles, rejected-file/type/size limits, image previews, upload progress,
custom child/RootProvider compositions, RTL, and operating-system reduced motion still need dedicated coverage.

Validation: `npm run check`, `npm run docs:build` (125 routes), and `git diff --check` pass. The existing docs
chunk-size advisory remains. Evidence: `file-upload-audit.json` and `file-upload-related-pattern.png`.

43 extensions remain without related-pattern fixtures. Native porting stays paused.

## Extension pass: splitter

The comparator now has 59 direct counterparts and fifteen independent related-pattern comparisons. Splitter
uses the pinned shadcn Resizable group, panels, and handles as its reference; Ark still supplies its own sizing
and interaction behavior. The reference fixture imports upstream components directly, without arkcn styles.

- Reduced the divider from 4px to the reference's 1px and added its wider pseudo-element hit area. Matched the
  grip's border color, 10px radius, dimensions, and vertical rotation, plus the 1px keyboard focus ring.
- Corrected the separator's ARIA orientation to describe the divider itself, perpendicular to the panel layout.
- Horizontal/vertical and enabled/disabled fixtures have no sampled geometry or style differences in light/dark
  themes at desktop and 700px viewport widths. Keyboard focus and resized endpoints match at equal panel sizes.
  The fixtures include disabled grips with unchanged styling, matching the reference.
- Pointer drags resize both axes. Dragging the disabled horizontal grip leaves its value at 40%; disabled grips
  have no tab stop and now expose `aria-disabled`. Home/End reach the same 20%/80% constraints on both implementations.
- Neither implementation animates resizing or transitions the sampled handle/grip styles. Normal and simulated
  reduced-motion fixtures retain this immediate response. Ark's default arrow increment remains 1%, versus the
  reference's 5%; this behavior difference is recorded separately from visual styling.

Outstanding: touch dragging, RTL, nested/multiple panels, collapse/expand, persistence, custom RootProvider and
registry compositions, and operating-system reduced motion still need dedicated coverage. The reference omits
`aria-valuenow` on disabled handles while Ark retains the current value.

Validation: `npm run check`, `npm run docs:build` (125 routes), and `git diff --check` pass. The existing docs
chunk-size advisory remains. Evidence: `splitter-audit.json` and `splitter-related-pattern.png`.

42 extensions remain without related-pattern fixtures. Native porting stays paused.

## Extension pass: hotkeys

The comparator now has 59 direct counterparts and sixteen independent related-pattern comparisons. Hotkeys
renders against pinned shadcn Kbd/KbdGroup and Dialog components. The authored group/row layout is shared fixture
content, not evidence of an upstream shortcut manager: registration, grouping, and shortcut formatting remain
arkcn features. The reference imports no arkcn components or recipes.

- Keycaps, sequences, dialog surface, title, description, and close button have no sampled geometry/style
  differences in light/dark themes at desktop and 700px viewport widths. The existing shared styles were retained.
- Fixed the cheat sheet always displaying `?`: the provider now supplies its configured dialog shortcut to the
  dialog. A custom `shift+h` shortcut displays the corresponding keycaps; `dialogHotkey={null}` omits the self
  shortcut and the otherwise-empty General section. Both cases match the independent reference presentation.
- Verified the default `?` and custom Shift H shortcuts open the dialog, Escape dismisses it, and disabling the
  dialog shortcut prevents it opening. Shift S and the G → H sequence each invoke their action once. A disabled
  action does not run, and typing Shift S in the input does not invoke the registered page shortcut.
- Entrance timing and keyframes match exactly: 100ms fade/scale. Exit uses the same timing/keyframes, with Ark's
  existing forwards fill until removal versus upstream's none. Simulated reduced motion gives `animation: none`
  and zero duration on both dialogs. No new motion or visual styling changes were necessary.

Outstanding: Windows/Linux key labels, alternate keyboard layouts, RTL, long/localized shortcut labels, multiple
providers, sequence timeout/overlap, nested dialogs, explicit allowInInput behavior, and operating-system reduced
motion still need coverage. Disabled registered actions remain listed by the existing cheat-sheet behavior; the
reference reproduces that content and does not establish shadcn behavior for shortcut registration.

Validation: `npm run check`, `npm run docs:build` (125 routes), and `git diff --check` pass. The existing docs
chunk-size advisory remains. Evidence: `hotkeys-audit.json` and `hotkeys-related-pattern.png`.

41 extensions remain without related-pattern fixtures. Native porting stays paused.

## Extension pass: tree select

The comparator now has 59 direct counterparts and seventeen independent related-pattern comparisons. Tree Select
uses upstream Select triggers, isolated Combobox chips, and Popover + Input Group + Combobox Empty. These check
shared visual parts, not a same-name tree control. The popup reference uses an outline Button anchor; its trigger
is deliberately excluded from the Select-trigger comparison. The reference imports no arkcn components or styles.

- Fixed the small single-select trigger rendering at 30px instead of 28px. Single-value triggers now use the
  Select height and padding recipes; multiple selection retains flexible minimum heights for wrapping chips.
- Reduced the empty state's vertical padding to match Combobox Empty. The initial 80px popup comparison used
  a customized reference Popover; it did not establish upstream default spacing. See the baseline correction below.
- Default, small, placeholder, disabled, invalid, and read-only triggers, plus isolated normal/disabled/read-only
  chips have no sampled geometry/style differences in light/dark themes at desktop and 700px viewport widths.
  Invalid trigger focus and focused popup search styles match. Hidden reference text/input nodes are excluded
  from visual-part comparisons. The combined multi-select trigger is not certified by the isolated-chip checks.
- In the separate Ark tree example, both selected people collapse into one Engineering chip. Filtering to Noah
  and deselecting him preserves Ava. A missing query shows No results. Chip removal and Clear work; disabled chip
  removal is unavailable. Clear restores the placeholder. These are Ark behavior checks, not shadcn tree parity.
- Popup entrance timing/keyframes match the reference's 100ms fade/scale/slide. Exit timing/keyframes also match,
  with Ark's existing forwards fill versus upstream's none. Simulated reduced motion disables animation on both.

Outstanding: Tree View row/checkbox styling, combined multi-select wrapping and focus-within states, nested and
large virtualized collections, branch selection options, keyboard tree navigation, read-only popup interactions,
RTL/locales, custom compositions, collision directions, and operating-system reduced motion still need coverage.

Validation: `npm run check`, `npm run docs:build` (125 routes), and `git diff --check` pass. The existing docs
chunk-size advisory remains. Evidence: `tree-select-audit.json` and `tree-select-related-pattern.png`.

40 extensions remain without related-pattern fixtures. Native porting stays paused.

## Extension pass: tree view

The comparator now has 59 direct counterparts and eighteen independent related-pattern comparisons. Tree View
uses upstream SidebarMenuSubButton rows, Checkbox, Label, and Input. The standalone row fixture removes the
sidebar-specific horizontal translation and adds one 16px tree indent to the standard 8px inset. Hierarchy is
arkcn behavior; this is a related-pattern comparison, not an upstream Tree View implementation.

- Matched label line height, row gap/inset, selected/hover/active text colors, and the outward full-color 2px focus
  ring. The standard 28px row height and 16px per-depth indentation are retained.
- Matched the checkbox's 4px corner radius, 14px check icon, unchecked dark surface, and color transitions.
  Explicit default icon sizes prevent the surrounding tree row's 16px icon rule from overriding the checkbox;
  actual icons inside Tree Select measure 14px in the reduced-motion check.
- Fixed the mixed-state selector, which did not match Ark's `data-state=indeterminate`. The user's approved
  primary fill/contrasting minus remains intentional, and is the only sampled color difference from shadcn.
- Rename now composes the shared Input recipe, retaining its compact 24px height and 4px padding. Focus border,
  ring, radius, dark surface, and responsive typography match an upstream Input with the same compact sizing.
- Sampled default/selected/disabled rows and checked/unchecked controls match in light/dark themes at desktop
  and 700px viewport widths. Focused rows and rename inputs match; the narrow rename text uses 16px as upstream.
  Rename submission emits the new label, Escape cancels, and arrow navigation skips the disabled final row.
- Checkbox toggling works. Transition properties, 150ms duration, and easing match upstream; simulated reduced
  motion reports zero duration. This verifies the checkbox transition recipe, not a frame-by-frame motion audit.

Outstanding: nested branch geometry and chevron motion, indent guides, checked rows with every selection/focus
combination, invalid/disabled custom checkbox compositions, drag/drop, async loading, long labels, RTL, controlled
rename persistence, custom RootProvider/asChild compositions, and operating-system reduced motion need further
coverage. Tree Select's combined chip-trigger gaps from the prior pass remain open.

Validation: `npm run check`, `npm run docs:build` (125 routes), and `git diff --check` pass. The existing docs
chunk-size advisory remains. Evidence: `tree-view-audit.json` and `tree-view-related-pattern.png`.

39 extensions remain without related-pattern fixtures. Native porting stays paused.

## Extension pass: transfer list

The comparator now has 59 direct counterparts and nineteen independent related-pattern comparisons. Transfer
List uses upstream Checkbox, Input Group, Button, and SidebarMenuSubButton parts. The reference's dual panels,
headers, counts, empty messages, and responsive arrangement are authored layout matching fixture content; these
are not upstream transfer-list styling. Only the shared control parts establish shadcn comparisons.

- Matched row focus-ring placement/color and selected/hover/active text colors. Default row geometry and move
  buttons already matched the corresponding reference parts.
- Fixed selected check icons rendering at 16px under the row's generic icon rule; explicit 14px icons now match
  upstream Checkbox. Indicators inherit ordinary text color while unchecked and use primary foreground only
  when selected. Their color transitions now match the upstream 150ms recipe.
- Sampled search surfaces, rows, selected indicators, and enabled/disabled move buttons match in light/dark
  themes at desktop and 700px viewport widths. Focused rows and search surfaces match. The user-approved primary
  mixed-state header checkbox remains intentional, as does the existing disabled-checkbox affordance.
- Selected-item transfer, move-all in both directions, and filtered move-all were exercised. Disabled Delete
  records stays in the source list; Move all right disables when no enabled source items remain. Filtering to
  nothing shows No matches, and an emptied target shows Nothing here. Space selects a row and Enter transfers it.
- Indicator transition properties, 150ms duration, and easing match. Simulated reduced motion sets durations to
  zero. This checks the transition recipe, not every frame of transfer or virtualization behavior.

Outstanding: globally disabled roots, shift/range selection, custom item renderers, long labels, very large
virtualized lists, controlled updates, focus after every transfer/filter combination, RTL, alternate empty-state
compositions, and operating-system reduced motion still need coverage. The authored panel surfaces and overall
transfer interaction are arkcn extensions and should not be described as an exact shadcn counterpart.

Validation: `npm run check`, `npm run docs:build` (125 routes), and `git diff --check` pass. The existing docs
chunk-size advisory remains. Evidence: `transfer-list-audit.json` and `transfer-list-related-pattern.png`.

38 extensions remain without related-pattern fixtures. Native porting stays paused.

## Extension pass: cascader and color picker

The comparator now has 59 direct counterparts and twenty-one independent related-pattern comparisons.
Cascader uses upstream Select triggers, Input Group, Popover, and Combobox Empty. Color Picker uses upstream
Label, Input Group/Button, Popover, and Button. Cascading columns, path selection, color gradients, and color
manipulation remain extensions; neither component has a same-name upstream counterpart.

- Cascader's six trigger cases (default, small, empty, disabled, invalid, readonly) match the sampled upstream
  styles in light/dark themes at desktop and 700px viewport widths. Focused triggers also match. Empty content
  padding matches Combobox Empty. The initial 80px popup measurement used a customized reference Popover;
  see the baseline correction below for the upstream default spacing.
- Fixed a Cascader keyboard bug reproduced during filtering: ArrowDown then Enter could select a hidden leaf
  when the query had no matches. Keyboard selection now stays within the filtered results. Clicking a leaf,
  searching for London and selecting it with the keyboard, clearing selection, and retaining the current value
  during a no-results keyboard attempt were verified.
- Color Picker's label now uses the shared 14px line height. Its swatch trigger composes Input Group's icon
  button, matching border, radius, hover/focus styling, and 150ms transitions. The transparency layer is bounded
  to the 20px swatch rather than filling the button's 22px inner box.
- Color Picker now exposes Ark's invalid channel state as `aria-invalid`, activating the shared red border/ring
  and communicating the invalid state to assistive technology. Default, disabled, invalid, readonly, and focused
  field styles match in the sampled themes and widths. Readonly triggers remain inert without disabled dimming.
- Color Picker popup padding/gap now use 10px, with shared typography, transform origin, and side-aware slide
  animation. Sampled surfaces match upstream in light/dark themes. Both components' entrance animation timing
  and keyframes match the 100ms upstream Popover recipe. Color Picker exit timing/keyframes also match, with
  Ark's `forwards` fill retained until unmount; upstream uses `none`. Simulated reduced motion disables motion.
- Hex editing, swatch selection, hue/alpha keyboard changes, and Escape dismissal were exercised on the actual
  Color Picker demo, independently from the shared-style fixture.

Outstanding: Cascader column/row and search-result styling, hover expansion, disabled branches, changeOnSelect,
long paths, narrow overflowing columns, RTL, custom compositions, and controlled updates need broader coverage.
Color Picker area pointer/keyboard movement, gradient rendering across formats, FormatSelect, eyedropper,
alpha transparency, custom compositions, and operating-system reduced motion remain outside this pass.

Validation: `npm run check`, `npm run docs:build` (125 routes), and `git diff --check` pass. The existing docs
chunk-size advisory remains. Evidence: `cascader-audit.json`, `cascader-related-pattern.png`,
`color-picker-audit.json`, and `color-picker-related-pattern.png`.

36 extensions remain without related-pattern fixtures. Native porting stays paused.

## Extension pass: angle slider and rating group

The comparator now has 59 direct counterparts and twenty-three independent related-pattern comparisons.
Angle Slider compares its Label and visible thumb against upstream Label and Slider. Rating Group compares
its Label and focus-ring treatment against upstream Label and Radio Group. The reference deliberately retains
its linear slider and radio circles: circular tracks, degree markers, stars, half-ratings, and hover previews
have no direct shadcn counterpart. Their overall geometry and colors are not certified as upstream matches.

- Both labels now use the shared 14px line height and flex alignment. Sampled label styles match in light/dark
  themes at desktop and 700px viewport widths.
- Angle Slider's focus ring was attached to its non-focusable Control. The actual focused Thumb consequently
  received the browser's narrow rotated-bar outline. The thumb now suppresses that outline and puts the 3px
  ring on its visible circular indicator. Its size, border, white fill, radius, and color/box-shadow transition
  match the upstream Slider thumb. The 150ms transition does not interpolate the angle, so dragging follows the
  pointer directly and wraparound does not spin through a full circle. Simulated reduced motion sets it to zero.
- Rating Group also attached its focus ring to a non-focusable Control. Focus styling now lives on each Item,
  with a rounded star-sized outline. Its ring width/color and suppressed native outline match the sampled
  upstream radio focus treatment; the ring shape remains appropriate to the custom star geometry.
- Angle Slider keyboard increment, Home (0), End (359), pointer dragging, disabled pointer input, and readonly
  keyboard input were exercised. End retains Ark's 359 endpoint rather than the reference linear slider's 360.
- Rating Group keyboard and pointer selection work; half-step keyboard input produces 2.5 and the half-star
  state. Disabled pointer input and readonly keyboard input retain the value. Existing star color transitions
  remain 150ms and become zero under simulated reduced motion; stars are not equated with the upstream radio
  indicator animation.

Outstanding: invalid Angle Slider presentation, RTL direction/markers, touch dragging, wraparound gestures,
controlled updates, custom children/asChild, Rating Group hover-preview restoration and half-star pointer
selection, form reset, screen-reader announcements, and operating-system reduced motion need more coverage.
The disabled star presentation is retained; the earlier upstream Radio disabled-recipe caveat still applies.

Validation: `npm run check`, `npm run docs:build` (125 routes), and `git diff --check` pass. The existing docs
chunk-size advisory remains. Evidence: `angle-slider-audit.json`, `angle-slider-related-pattern.png`,
`rating-group-audit.json`, and `rating-group-related-pattern.png`.

34 extensions remain without related-pattern fixtures. Native porting stays paused.

## Extension pass: steps and floating toolbar

The comparator now has 59 direct counterparts and twenty-five independent related-pattern comparisons.
Steps uses upstream Button, Progress, and Separator; its circular indicators and workflow layout remain Ark
extensions. Floating Toolbar uses upstream Popover surfaces with Button, Input, and Separator. The reference
is anchored; arkcn's floating positioning and keyboard behavior remain custom.

- Steps previously exposed its percentage through ARIA without rendering a filled bar. It now draws a primary
  range using Ark's percentage, with the same clipped track and transition recipe as shadcn Progress. Measured
  one-third and completed widths match the reference. Existing custom children/asChild remain available.
- Removed the trailing connector after the last step, including the visible extra line in vertical orientation.
  Existing current/completed indicator styling and connector color transitions remain custom.
- Sampled navigation button and progress styles match in both themes at desktop and 700px viewport widths.
  Next/Back disabled states, completion content, and direct keyboard activation of the vertical Review step
  were exercised. The range uses the reference's 150ms transition and zero duration under simulated reduction.
- Floating Toolbar now uses Popover's background, foreground, 10px padding/gap/radius, ring, shadow, and 14px
  typography. The former glass blur, border, oversized shadow, and hover scaling were removed. Identical
  desktop content measures 352.296875 by 52px in both implementations and themes, including after hovering.
- Floating Toolbar wraps within its available width; the 700px comparison viewport produces a 220px-wide,
  90px-tall toolbar. This responsive wrapping is custom layout, not an upstream Popover geometry claim.
- Added 100ms fade/scale entrance and exit using Ark Presence. Exit remains mounted through the fade and then
  unmounts; there is no hover delay or size animation. Simulated reduction disables animation, and the component
  includes a system reduced-motion rule. Its unanchored fade intentionally has no Popover side-slide.
- Fixed toolbar Home/arrow navigation stealing focus from text editors. An input retains focus and Home moves
  its caret to zero. Disabled action buttons are skipped, Escape from an action closes the toolbar, and reopening
  works. Portalled descendants and editable fields are excluded from toolbar keyboard handling.

Outstanding: Steps linear/invalid/skippable flows, long labels and cramped horizontal layouts, indicator focus
and hover combinations, controlled updates, RTL, and custom Progress children need broader coverage. Floating
Toolbar nested menu interactions, multiple enabled actions, custom asChild surfaces, focus restoration after
close, rapid animation reversal, oversized individual children, RTL, touch input, and system reduced-motion
execution remain outside the exercised cases.

Validation: `npm run check`, `npm run docs:build` (125 routes), and `git diff --check` pass. The existing docs
chunk-size advisory remains. Evidence: `steps-audit.json`, `steps-related-pattern.png`,
`floating-toolbar-audit.json`, and `floating-toolbar-related-pattern.png`.

32 extensions remain without related-pattern fixtures. Native porting stays paused.

## Floating Toolbar spacing follow-up

At the user's request, the arkcn example centers its fixed-height divider and gives the selection count the
same 10px padding plus 1px transparent border as the adjacent small button. Visible text-to-divider spacing
is now 21px on each side. The public example uses the same count inset. These are deliberate composition
adjustments; the earlier identical overall-width measurement predates this change.

The first divider fix also changed the authored reference example's alignment. That reference override was
removed after the user questioned it. The pinned upstream Separator source was never changed; its original
stretch alignment now remains visible in the reference. Future styling fixes belong on the arkcn side, not in
the reference merely to make both sides agree.

## Cascader and Tree Select popup baseline correction

Removed the authored reference overrides for Popover width, minimum width, padding, and gap, and the redundant
Input Group height/shrink override. The generated reference now renders those upstream parts with their default
classes. Pinned shadcn component sources remain unchanged; trigger and wrapper customizations remain disclosed
in the comparator.

The clean reference exposed a real mismatch: arkcn forced 4px padding and gap while upstream Popover uses 10px.
Both arkcn components now inherit the shared Popover spacing. Their empty desktop popups measure 288 by 98px,
matching the unmodified reference surface. Sampled colors, radius, shadow, search-field geometry, and focused
input styles match in light and dark themes. This supersedes the earlier 80px popup parity claims.

Popup width remains a functional extension: Tree Select follows its trigger, and Cascader can grow to accommodate
columns. At a 700px comparison viewport, Tree Select is 252px wide versus the reference Popover's fixed 288px;
both retain 98px height and 10px spacing. This is not a width-parity claim.

Both components' entrance and exit keyframes match the reference at 100ms. Ark's exit uses forwards fill until
unmount, while the reference uses none; both disconnect after exit. Reduced-motion surface checks, Cascader's
multi-column rendering and keyboard selection of filtered London, and Tree Select's filtered deselection of
Noah while preserving Ava were exercised. The previously listed broader behavior gaps remain open.

Validation: `npm run check`, `npm run docs:build` (125 routes), `npm run audit:check`, and `git diff --check` pass.
Evidence: `popup-baseline-correction.json` and `popup-baseline-correction.png`. This is a correction to two existing
comparisons, not new extension coverage: 32 extensions still lack related-pattern fixtures. Other disclosed
reference customizations still need review; native porting remains paused.

## Extension pass: floating panel

Added an independent upstream Popover + Title + Button comparison with no component styling overrides. Its one
wrapper only arranges the three buttons in a row. The reference keeps its default Popover layout; arkcn's title
bar, body padding, dimensions, dragging, resizing, and window stages are extensions, not upstream geometry matches.

- Corrected the panel's radius from 14px to the reference's 10px and replaced its larger shadow with Popover's
  medium shadow. Sampled background, foreground, typography, radius, ring/shadow, and three icon-button styles
  match in light and dark themes.
- Changed fade/scale entrance and exit from 150ms to 100ms. Exit remains mounted through its fade and then
  disconnects; reopening works. Floating Panel has no anchor-side slide, unlike the reference Popover. Simulated
  reduced motion disables animation and button transitions; the panel also now declares a system reduced-motion
  animation rule. Operating-system preference execution was not tested.
- Minimize produces a 36px title bar, maximize fills the comparison frame, and restore returns to the configured
  288 by 200px size. Dragging moved the panel by 60px horizontally and 40px vertically.
- Found and fixed zero-sized resize handles: corners now have a 12px hit area, and edges have 6px thickness.
  A southeast drag successfully resized the panel to 328 by 230px. Disabled handles ignore pointer events.
- Removed a redundant Positioner in the public example (Content supplies it), and placed the window controls
  beside the title drag handle, matching the audit example's composition.

Remaining panel checks include other resize axes, keyboard move/resize flows, constrained/very narrow containers,
RTL, touch, custom children/asChild, rapid stage/close reversals, and controlled updates. Shared-style parity does
not imply Popover-equivalent behavior or full panel-layout parity.

Validation: `npm run check`, `npm run docs:build` (125 routes), `npm run audit:check` (211 reference files), and
`git diff --check` pass. The existing docs chunk-size advisory remains. Evidence: `floating-panel-audit.json`
and `floating-panel-related-pattern.png`. Coverage is now 59 direct counterparts and 26 related-pattern fixtures;
31 extensions remain without fixtures. Native porting stays paused.

## Extension pass: signature pad and timer

Added two independent related-pattern fixtures without any reference component class/style overrides. Signature
Pad uses upstream Label, Textarea, and icon Button; its reference keeps the default textarea dimensions and the
button remains outside it. Timer uses upstream outline/small Buttons with independent action-state switching.
The reference does not fabricate a drawing canvas or countdown display. Wrapper styles only arrange examples.

- Signature Pad labels now use Label's flex layout, 8px gap, and 14px line height instead of a 20px line height.
- The drawing surface now uses Textarea's 10px radius, disabled background in both themes, and invalid border
  and ring when `aria-invalid` is supplied to Control. Its 160px height and signature guide remain custom.
- Added the missing focus-visible border/ring on the drawing surface itself, retaining focus-within treatment
  for its Clear button. Keyboard focus on the pad matches the sampled reference Textarea ring and border.
- Prevented disabled opacity from compounding: Clear inherits the disabled pad's 50% opacity instead of applying
  an additional 50% fade. Default and invalid button geometry remains the upstream 28px icon-small size.
- Sampled label and surface properties match for default, disabled, read-only, and invalid states in both themes.
  Surface color transitions are 150ms normally and zero under simulated reduction. Clearing removes all strokes;
  drawing adds a stroke, while disabled and read-only pads reject new pointer strokes.
- **Behavior issue found (resolved in the follow-up below):** Ark's read-only Signature Pad permits its Clear trigger to erase existing strokes.
  This was reproduced and is not certified as read-only parity. The reference explicitly disables its independent
  read-only Clear button; it was not changed to conceal the discrepancy. Root/RootProvider and imperative-clear
  semantics need a separate consistent fix rather than a visual-only disabled appearance.
- Timer's idle, running, and paused action buttons, including an explicitly disabled action, match sampled
  geometry, typography, colors, borders, and transitions in both themes. Keyboard focus also matches. No Timer
  production styling change was needed. The real countdown advanced, held steady while paused, resumed, and
  reset to 01:00; the reference's action switching only exercises button styles.

Remaining checks at this pass included Signature Pad read-only clearing, touch/pressure, export/form handling, controlled paths,
invalid-plus-focused combinations, narrow layouts, and Timer completion, count-up, custom children, and constrained
layouts. Drawing geometry and timer digit styling have no same-name shadcn counterparts and remain extensions.

Validation: `npm run check`, `npm run docs:build` (125 routes), `npm run audit:check` (213 reference files), and
`git diff --check` pass. Evidence: `signature-pad-audit.json`, `signature-pad-related-pattern.png`, `timer-audit.json`,
and `timer-related-pattern.png`. Coverage is now 59 direct counterparts and 28 related-pattern fixtures; 29
extensions still lack fixtures. Native porting remains paused.

## Signature Pad read-only follow-up and QR Code audit

Signature Pad now routes Root through the same guarded public `useSignaturePad` hook used with RootProvider.
Read-only and disabled pads disable the Clear trigger and ignore public `clear()` calls. Field read-only/disabled
defaults are inherited; explicit false overrides remain supported. Omitted options are removed before passing
them to Ark so generated IDs and other Field defaults are retained. Controlled parent updates to paths remain
available; the guard applies to user-triggered and public imperative clearing.

Regression checks cover Root and hook/RootProvider composition, custom clear buttons, inherited Field read-only
state, explicit editable overrides, and generated IDs. Browser checks confirmed disabled read-only Clear, unchanged
stroke count after a read-only API clear, successful API clearing after enabling editing, and ordinary Root clearing.
The provider must receive the public arkcn hook's value to gain its guarded API; raw third-party Ark API objects
retain their own behavior. The prior read-only clearing gap is closed for these public composition paths.

Added a QR Code related-pattern comparison using unmodified shadcn Buttons: default outline, disabled outline,
and custom small secondary. The reference has zero component styling overrides and one wrapping layout.

- QR Code's default download trigger was a bare button with no border, radius, padding, or disabled fade. It now
  uses the same outline Button recipe as Download Trigger. `asChild` preserves the consumer's button variant/size.
- Sampled download-button geometry, typography, colors, borders, radius, disabled opacity, and keyboard focus
  match the independent reference in both themes. Transitions are 150ms normally and zero under simulated reduction.
- QR matrix, frame, overlay, and encoding remain custom; their geometry is not compared to invented shadcn equivalents.
- The SVG download was attempted, but browser download-event observation timed out and no file delivery was
  confirmed. Export success, raster exports, scanning, overlays, and constrained layouts remain unverified.

Validation: `npm run check`, `npm run docs:build` (125 routes), `npm run audit:check` (214 reference files), and
`git diff --check` pass. Evidence: `signature-pad-readonly.json`, `qr-code-audit.json`, and `qr-code-related-pattern.png`.
Coverage is now 59 direct counterparts and 29 related-pattern fixtures; 28 extensions still lack fixtures.
Native porting remains paused.

## Tour related-pattern follow-up

Added a Tour comparison using untouched shadcn Dialog, Popover, and Button recipes. The reference has zero
component styling overrides and five wrapper styles. Spotlight, targeting, progress, and step navigation remain
Ark extensions; this is a related-pattern comparison, not a direct shadcn Tour counterpart.

- Split the shared surface recipe by step type. Centered steps now use Dialog spacing, width, radius, title
  typography, ring-only surface, and 10% blurred backdrop. Anchored steps use Popover's 288px width, 10px padding
  and gaps, 10px radius, 14px title, and medium shadow.
- Sampled shared surface and typography properties match in both themes. Centered examples measure 384×160px
  on desktop and 284×160px in the narrow comparison frames. Anchored heights differ intentionally in this fixture:
  172px reference versus 134px Tour, because the unmodified reference Close button occupies a separate flow row
  while Tour places it in the corner. The reference was not restyled to hide that composition difference.
- Enter animations match the reference's 100ms fade/scale keyframes, including anchored directional placement.
  Exit keyframes also match; Ark retains its forwards fill until removal. Both contents unmount after dismissal.
  Removed unintended transform-origin transitioning during initial positioning. Simulated reduced motion disables
  content animations and spotlight movement transitions; operating-system reduction remains untested.
- Fixed anchored positioner stacking by supplying Ark's `--tour-z-index` input. Previously the backdrop covered
  and dimmed the card and intercepted its buttons. Fresh entry and Next → Back → Next → Done now work.
- Sampled action-button geometry, colors, borders, radius, and shadows match. Hidden Close text differs without
  changing visible styling. Spotlight movement across multiple targets, all placements, scrolling targets, RTL,
  touch behavior, long text, and keyboard focus management beyond these interactions remain to be exercised.

Validation: `npm run check`, `npm run docs:build` (125 routes), `npm run audit:check` (215 protected reference files),
and `git diff --check` pass. Evidence: `tour-audit.json`, `tour-dialog-related-pattern.png`, and
`tour-anchored-related-pattern.png`. Coverage is now 59 direct counterparts and 30 related-pattern fixtures;
27 extensions still lack fixtures. Native porting remains paused.

## Activity Feed related-pattern follow-up

Added an independent reference using untouched shadcn Item, Empty, and outline/small Button recipes. It has
zero component styling overrides and two wrapper styles. The user prefers arkcn's timeline arrangement;
markers, connector layout, group labels, timestamps, and event composition are not direct shadcn counterparts.

- At the user's request, removed the detail cards: no background, border, radius, or padding surrounds event text.
  Replaced the list-wide connector with per-item lines between marker centers; the last item has no connector.
  The existing timeline layout remains. Two- and three-event layouts were inspected in light/dark themes.
- Matched event actor and detail typography to ItemTitle and ItemDescription: Geist 14px, medium/normal weights,
  19.25px/21px line heights, and foreground/muted colors. Measured typography matches the untouched reference.
- Row focus now uses Item's ring-colored border and 3px half-opacity ring. Color transitions use 100ms and are
  disabled under reduced motion. Row padding, timeline spacing, and overall geometry remain intentionally different.
- Empty state now reuses the shared Empty surface instead of a fixed-height bordered card. Its 24px padding,
  14px radius, 16px gap, and 70.75px sample height match the reference; message typography matches EmptyDescription.
- Enabled and disabled load-button sampled styles match in both themes. Loading another event works, and
  PageUp/PageDown and Ctrl+Home/End focus the expected events. Reference Item is used only for visual comparison,
  not as a substitute implementation of feed navigation.
- A pre-existing DialogTitle canonical-class lint failure was resolved by expressing `text-base leading-none`
  as `text-base/none`, with the same rendered font size and line height.

Validation: `npm run check`, `npm run docs:build` (125 routes), `npm run audit:check` (216 protected reference files),
and `git diff --check` pass. Broader grouped, icon/avatar-marker, long-content, RTL, constrained-width, async/busy,
and real OS reduced-motion coverage remains outstanding. Evidence: `activity-feed-audit.json`, `activity-feed-light.png`, and
`activity-feed-dark.png`. Coverage is now 59 direct counterparts and 31 related-pattern fixtures; 26 extensions
still lack fixtures. Native porting remains paused.

## Swap related-pattern follow-up

Added a Swap comparison with untouched shadcn outline/icon Buttons in enabled, pressed, disabled, and keyboard
focus states. The reference has zero component styling overrides and one wrapper style. Shadcn has no Swap
counterpart; the icon crossfade is assessed as an Ark extension, not portrayed as upstream behavior.

- Shared button measurements match in both themes: 32px button, 16px resting icon, border, radius, colors, disabled
  opacity, and focus ring. Reference icons switch immediately; the reference was not given an invented animation.
- The previous CSS transition did not produce the intended swap: the outgoing indicator was hidden immediately
  (zero rendered dimensions on the first recorded frame) and the incoming indicator appeared at full opacity.
- Replaced the transitions with 200ms enter/exit fade-and-scale animations that Ark Presence can observe. Frame
  samples now show both icons rendered together with complementary opacity and 75–100% scale; the outgoing
  indicator is hidden after completion. Button dimensions remain stable.
- Space toggles the pressed state. Rapid reversal settles with one visible icon. Simulated reduced motion produces
  no animation or transition and immediately shows only the selected icon. OS-level reduction, custom content with
  unequal dimensions, hook/RootProvider composition, and optional lazy/unmount modes remain unverified.

Validation: `npm run check`, `npm run docs:build` (125 routes), `npm run audit:check` (217 protected reference files),
and `git diff --check` pass. Evidence: `swap-audit.json` and `swap-related-pattern.png`. Coverage is now 59 direct counterparts and 32
related-pattern fixtures; 25 extensions still lack fixtures. Native porting remains paused. Activity Feed's
connector remains solid, as agreed with the user.

## Marquee related-pattern follow-up

Added a Marquee fixture comparing Badge content and Button controls with untouched shadcn recipes. The reference
has zero component styling overrides and three wrapper styles. It deliberately remains static: shadcn has no
Marquee counterpart, so scrolling, repetition, clipping, and fades are assessed as Ark extensions.

- Shared Badge and Button geometry, typography, colors, borders, and radius match in light and dark themes.
- Vertical edge overlays previously occupied the full 144px scroller with no gradient. They now use 48px-high
  top/bottom strips with correctly directed fades. Horizontal fades retain 48px width. Removed physical left/right
  offsets that conflicted with Ark's logical positioning; RTL start/end positions and gradient directions are verified.
- Pause holds the sampled transform between observations; Resume returns to running, and Reverse sets reversed
  animation direction. Horizontal and vertical animations are present. Exact speed, loop seams, finite-loop callbacks,
  delayed starts, interactive children, and pause-on-hover/focus remain unverified.
- Reduced motion disables animation, hides duplicate content and fades, and enables manual overflow scrolling.
  The current-frame simulation mirrors these layout effects; the reference stylesheet remains untouched. Verified
  both orientations and a narrow viewport: ArrowRight scrolled the 212px original content within a 202px viewport.
- Generated CSS inspection exposed a cascade issue masked by the audit's simulated animation stop: direction/state
  animation utilities can override an ordinary reduced-motion utility. Marquee, Swap, and Tour now use an explicit
  important reduced-motion animation override. This corrects those production media rules; a real OS preference
  toggle has still not been exercised, so earlier simulated checks are not proof of OS-level behavior.

Validation: `npm run check`, `npm run docs:build` (125 routes), `npm run audit:check` (218 protected reference files),
and `git diff --check` pass. Compiled system reduced-motion rules were inspected. Evidence: `marquee-audit.json`
and `marquee-related-pattern.png`. Coverage is now 59 direct counterparts and 33
related-pattern fixtures; 24 extensions still lack fixtures. Native porting remains paused.

## Comment Thread composer related-pattern follow-up

Added a composer comparison against untouched Input Group + Textarea + block-end Addon, plus Avatar and Button.
The reference has zero component styling overrides and two wrapper styles. This pass covers the composer and
shared avatar/action parts, not the entire comment/reply/reaction layout or mention-menu styling.

- Composer surface now uses the Input Group radius, border, transparent/light and translucent/dark backgrounds,
  and input-only focus treatment. Added inherited invalid border/ring styling from the composer input. Footer
  button focus no longer incorrectly highlights the whole composer.
- Removed extra container padding and gaps. Input now has 64px minimum height, 8px vertical/10px horizontal padding,
  and responsive 16px/14px text. Footer uses the block-end Addon's padding, muted text, and typography. Reply strips
  retain their custom layout with padding aligned to the updated composer.
- Enabled composers measure 384×108px on desktop and 252×108px in the narrow comparison, with matching sampled
  visible surface, input, and footer properties. Light/dark invalid rings and keyboard focus match. Zero-width
  input borders and zero-spread shadow serialization differ without a visible effect.
- Default and nested small avatars and enabled action-button properties match the reference. A deliberate
  exception remains when Send is disabled: upstream Input Group's broad `has-disabled` rule dims the whole editable
  group and changes its background. arkcn keeps its editable composer undimmed and disables only Send. The reference
  is unchanged, so this difference remains visible instead of being hidden by a fixture override.
- Cancel clears text and disables Send. Typing a mention query, selecting a person with Enter, and submitting the
  resulting chip work; submission yields plain `@Ava Chen` text and clears the input. Footer focus does not activate
  the input ring. Simulated reduced-motion transitions are zero; normal transitions are 150ms.

Validation: `npm run check`, `npm run docs:build` (125 routes), `npm run audit:check` (219 protected reference files),
and `git diff --check` pass. Evidence: `comment-thread-audit.json` and `comment-thread-related-pattern.png`.
Long/multiline text, reply/edit state, reactions, mention-menu styling, paste/IME, controlled inputs, and OS-level
reduced-motion behavior remain unverified in this pass. Coverage is now 59 direct counterparts and 34 related-pattern
fixtures; 23 extensions still lack fixtures. Native porting remains paused.

## Chat search and composer related-pattern follow-up

Added an independent comparison with untouched shadcn Input Group, inline Addons, InputGroupButton, and Button.
The reference has zero component styling overrides and two wrapper styles. This pass covers search and composer
controls; conversation rows, message bubbles, headers, empty states, and mobile panel navigation remain outside it.

- Search and composer now use 32px Input Group surfaces, 10px radii, matching padding and light/dark backgrounds.
  Inputs use responsive 16px/14px text. Shared input-only focus and invalid selectors add the corresponding border
  and ring; disabled input surfaces match the reference's background and opacity.
- The default Send button now matches the 24px InputGroupButton with a 16px icon and 7px radius. Explicit Button
  sizes, variants, children, and asChild remain supported. Both the optional actions wrapper and direct Send child
  composition are checked; the latter differs by less than 0.01px due to flex/margin rounding.
- Sampled visible styles match for light/dark surfaces, invalid states, dark disabled states, input focus, and Send
  focus. Zero-width input border colors and zero-spread shadow serialization differ without a visible effect.
  Focusing Send leaves the input surface ring off. Enter from the input and keyboard activation of Send submit
  and clear the controlled fixture. The fixture does not send network messages.
- At the narrow comparison width, surfaces measure 252×32px and input text is 16px/24px; desktop surfaces are
  384×32px with 14px/20px inputs. Normal field transitions are 150ms and simulated reduced-motion transitions zero.
  Production field/input rules also disable transitions under reduced motion; an OS preference toggle is unverified.
- As in Comment Thread, only a disabled input dims the whole composer. Disabling Send alone does not dim an editable
  input, unlike upstream's broad has-disabled selector. This exception is not hidden by reference overrides.

Validation: `npm run check`, `npm run docs:build` (125 routes), `npm run audit:check` (220 protected reference files),
and `git diff --check` pass. Evidence: `chat-audit.json` and `chat-related-pattern.png`. Hover/pressed states, RTL,
custom action sizes, and polymorphic compositions are not visually verified in this pass. Coverage is now 59 direct
counterparts and 35 related-pattern fixtures; 22 extensions still lack fixtures. Native porting remains paused.

## Chat conversation and empty-state follow-up

Expanded the existing Chat fixture with a Conversation parts toggle. The added reference uses untouched Item,
Avatar, Button, and Empty components; the whole fixture has zero component styling overrides and four wrapper
styles. A selected conversation uses Item's public muted variant. No upstream component or reference CSS was edited.

- Conversation rows now use Item's 10px radius, transparent border, 10px/12px padding, 10px content gap, and
  100ms color transition. Keyboard focus adds the matching border and 3px ring. Selected rows use muted/50 in
  both mobile and desktop layouts. Disabled rows retain an explicit disabled affordance.
- Names and header titles use 14px/19.25px medium text; previews and header descriptions use 14px/21px regular
  muted text with a 4px title/description gap. Removed the preview's hover recoloring and breakpoint-dependent
  header font sizes. Header spacing now matches Item; removed its oversized shadow, card fill, and bottom margin.
- Empty content now uses 24px padding, a 32px muted icon surface with a 16px icon, a 14px medium title, and
  14px/22.75px muted description. Its direct children use the same spacing as the reference's nested EmptyHeader.
- Light/dark sampled row surfaces, selected states, typography, and empty parts match. Rows and header measure
  384×66.25px with one-line descriptions; the empty block measures 384×146.75px. At 252px comparison width,
  description wrapping and resulting heights also match. Title spans fill available width for truncation whereas
  ItemTitle uses width-fit; this does not change the sampled text's appearance. The static Chat header has no color
  transition; Item declares 100ms. The empty wrappers have different nesting, with matching child placement.
- Keyboard Space changes selection and updates the header. Keyboard row focus matches the reference ring.
  Row transitions are 100ms normally and zero under simulated reduced motion. OS preference changes remain untested.
- In the full docs example at 430px viewport width, Back returns to the list, selecting Noah opens his panel,
  and Enter sends a local example message, clears the input, and updates the row preview. Desktop panel/header
  scroll widths match their client widths. These checks cover the basic route through the mobile layout, not
  complete mobile accessibility or focus management.

Chat retains a muted hover affordance on button rows; the upstream Item reference rendered as a button has no
hover recipe (its hover rule targets anchors). This is a documented interaction extension, not a reference override.
Message bubbles, timestamps, sidebar headings, list dividers, panel/empty-pane surfaces, long unbroken names,
RTL, disabled row visuals, custom children, and mobile focus management remain outside this follow-up.

Validation: `npm run check`, `npm run docs:build` (125 routes), `npm run audit:check` (220 protected reference files),
and `git diff --check` pass. Evidence: `chat-details-audit.json`, `chat-details-related-pattern.png`, and
`chat-mobile.png`. Coverage stays at 59 direct counterparts and 35 related-pattern fixtures, with 22 extensions
still lacking fixtures. Native porting remains paused.

## Chat message surfaces and infrastructure classification

Added a Message parts view using untouched upstream Bubble/BubbleContent and MessageFooter. The Chat reference
now has zero component styling overrides and five wrapper styles. Its RTL toggle exercises the same text in both
directions; no reference styling was changed.

- Chat messages now use Bubble's 14px radius, transparent 1px border, 12px/8px padding, 80% maximum width,
  14px/22.75px text, and solid primary/primary-foreground or muted surfaces. Removed the heavy shadow, faded
  sent colors, fixed 288px cap, and asymmetric corners.
- Timestamps now use MessageFooter's 12px/16px medium, upright typography. Chat keeps timestamps inside its
  bubble with a 4px top margin, so it does not copy the footer's outside placement or 12px horizontal padding.
  Received timestamps use muted text; sent timestamps use primary-foreground/80 for their primary surface.
- Sampled message geometry, colors, border/radius, shadow, typography, and alignment match in the light desktop
  fixture and dark narrow fixture, including RTL. Long unbroken tokens wrap; sampled scrollWidth equals clientWidth.
  These are static messages, with no new entry or exit animation. The full Chat pane, message-stream spacing,
  timestamp placement, sidebar heading/dividers, and responsive pane surfaces remain custom layouts, not exact
  shadcn component counterparts. Attachments, rich content, nested controls, and mobile focus management remain
  unverified. Existing controlled-send checks from the preceding passes still apply to the unchanged behavior.

Source-reviewed ClientOnly, FocusTrap, Format, LiveRegion, Portal, and Presence. None provides visible default
control styling: ClientOnly, FocusTrap, Format, and Portal inherit appearance from their children/callers,
LiveRegion is visually hidden, and Presence takes animation styles from callers. The audit now identifies these
six explicitly and omits the misleading empty shadcn comparison frame. This classification is not a behavior,
hydration, animation-lifecycle, or screen-reader certification. Format's example rendered its existing formatted
values in the single current frame; the reference-frame count was zero. No helper production code was changed.

There are 16 styled extensions still lacking comparison fixtures: App Shell, Canvas, Data Grid, Data Table,
Frame, Gantt, Highlight, Image Cropper, JSON Tree View, Kanban, Node Graph, Query Builder, Rich Text Editor,
Scheduler, TOC, and Virtual List. The six nonvisual helpers are tracked separately. Coverage remains 59 direct
counterparts and 35 related-pattern fixtures; this classification does not add any visual matches.

Validation: `npm run check`, `npm run docs:build` (125 routes), `npm run audit:check` (220 protected reference files),
and `git diff --check` pass. Evidence: `chat-messages-audit.json`, `chat-messages-related-pattern.png`, and
`nonvisual-format-audit.png`. Native porting remains paused.

## Virtual List related-pattern follow-up

Added an independent reference containing 100 untouched shadcn Item rows, Empty/EmptyDescription, and Button.
The fixture has zero component styling overrides and three wrapper styles. Its native scrolling container is an
explicit fixture wrapper; shadcn does not supply the virtualization implementation. Current rows deliberately
compose the already-audited arkcn Item, so this checks that windowing preserves the caller's row styles rather than
claiming Virtual List owns those styles.

- VirtualList.Empty now reuses Empty.Root with the corresponding description typography. Replaced 32px vertical-only
  padding and ordinary 14px line height with 24px padding, a 14px radius, and 14px/22.75px muted text. Light/dark
  empty blocks measure 70.75px high, matching Empty + EmptyDescription. The reference puts text styles on its child;
  arkcn applies them to its empty root, retaining default text, custom children, and asChild.
- The 256px-high fixture shows matching sampled row padding, gap, colors, radius, typography, dimensions, and
  positions at 252px and 384px widths. Short and wrapped rows measure 66.25px and 87.25px. The 16px row gap comes
  from the public gap prop and upstream ItemGroup, not from reference styling overrides.
- At the initial position, arkcn mounts nine rows while the reference mounts all 100. Last reaches record 100
  with ten mounted rows and the final row at the viewport bottom (fractional measurement/scroll rounding below
  1px). Total scroll heights differ because unvisited virtual rows retain estimates; this is expected and visible.
- Empty removes all rows, resets scroll position, and displays the matching message. Restoring rows works.
  Page Down moves both viewports by 234px, and First returns both to zero. The rendered window advances while
  preserving the sampled positions of its measured rows. Normal and simulated reduced-motion fixtures render.

No virtualization algorithm or animation was changed. Smooth scrolling, OS-level reduced motion, insert/reorder
measurement invalidation, image/font-driven height changes, interactive-row focus retention, and 100,000-row
performance remain unverified. This pass does not certify the virtualization behavior or native scrollbar parity.

Validation: `npm run check`, `npm run docs:build` (125 routes), `npm run audit:check` (221 protected reference files),
and `git diff --check` pass. Evidence: `virtual-list-audit.json`, `virtual-list-related-pattern.png`, and
`virtual-list-empty.png`. Coverage is now 59 direct counterparts and 36 related-pattern fixtures. Fifteen styled
extensions still lack comparison fixtures; six helpers have no visible default styling. Native porting stays paused.

## JSON Tree View related-pattern follow-up

Added an independent fixture using untouched compact SidebarMenuSubButton rows and Button. It has zero component
styling overrides and three layout wrappers. Shadcn has no JSON tree counterpart: this compares shared row geometry,
selection colors, and focus treatment. Monospace typography, syntax colors, depth indentation, root preview, guides,
and tree expansion remain explicit Ark extensions rather than claimed exact matches.

- Increased branch/leaf rows from 24px to 28px, matching compact Sidebar rows; both measure an 8px radius and 12px
  text. Keyboard focus now uses the matching opaque 2px ring instead of a faint inset ring. Dark selected backgrounds
  match at neutral 0.269; normal foreground colors match in light and dark themes.
- Supplied a default 16px chevron while retaining the public arrow override. Previously the primitive rendered no
  expand icon unless callers supplied one. The chevron rotates over 150ms; the reference swaps icons instantly.
  Arrow-key navigation reached the branch with a visible focus ring, and left/right collapsed/expanded its children.
- Changed depth padding and guide placement to logical properties. RTL reverses indentation and puts guides on the
  right. Collapsed RTL arrows point left (180deg), expanded arrows point down (90deg).
- Fixed stale syntax selectors: Ark renders data-kind=key/colon and data-type=string/boolean/number/null, not the
  old data-part=value/key structure. Existing emerald/amber/sky/muted colors now apply to values; no palette change.
- Added truncation to branch previews and leaf text. The narrow description fits a 180px text box with ellipsis
  rather than overflowing its row; the full accessible label remains available. The wider tree is 384px with no
  horizontal overflow. Light/dark and LTR/RTL fixtures were inspected.
- Simulated reduced motion yields zero-duration indicator transitions; the component also includes a motion-reduce
  transition-none rule. An intermediate rotation was observed during normal collapse. OS-level reduced motion,
  arbitrary custom renderers/arrows, very deep trees, async data replacement, and full screen-reader behavior remain
  unverified. This fixture does not certify the JSON tree's complete interaction contract.

Validation: `npm run check`, `npm run docs:build` (125 routes), `npm run audit:check` (222 protected reference files),
and `git diff --check` pass. Evidence: `json-tree-view-audit.json`, `json-tree-view-related-pattern.png`, and
`json-tree-view-rtl.png`. Coverage is now 59 direct counterparts and 37 related-pattern fixtures. Fourteen styled
extensions still lack fixtures: App Shell, Canvas, Data Grid, Data Table, Frame, Gantt, Highlight, Image Cropper,
Kanban, Node Graph, Query Builder, Rich Text Editor, Scheduler, and TOC. Native porting stays paused.

## TOC docs-reference follow-up

Added the pinned upstream `apps/v4/components/docs-toc.tsx` to the isolated reference preparation. Its list markup,
classes, and observer logic are unchanged. Only imports are remapped: the unused dropdown branch resolves against
existing isolated UI dependencies and its unused menu icon is mapped to Lucide. This comparison renders list mode
only; it does not certify dropdown mode. The source link now points directly to this docs component. The authored
fixture has zero component style overrides and seven layout wrappers, including article space below the final
heading so all anchor targets can reach the viewport top.

- Matched the docs TOC's 12.8px link text, inherited 18.2857px line height, active medium weight, muted/foreground
  colors, 8px row gaps, 24px title, and 16px outer padding with no top padding. Removed arkcn's default left rail,
  link borders, and vertical link padding. The optional indicator remains available separately.
- Depth 2 links start at zero; depths 3 and 4 indent 16px and 24px. Light/dark LTR samples match position, width,
  height, typography, colors, and wrapping. At a 231px link width, the long heading wraps to 36.5625px in both.
  Arkcn uses logical padding so RTL mirrors the hierarchy; upstream physical left padding is left untouched.
- Repaired the optional indicator's missing top/height styles using Ark's measured variables. It now aligns to
  the active row (Advanced options: y=100.5625px, height=18.28125px in the standalone fixture), sits 8px outside
  the content edge, and transitions top/height over 150ms. It mirrors to the right in RTL. Link/indicator transitions
  are disabled by motion-reduce utilities; simulated reduced-motion inspection reports 0s.
- Standalone link clicks scroll to Configuration and Advanced options, update aria-current, and apply the matching
  500-weight foreground style. Keyboard Tab reaches links with a visible browser focus outline. The comparison
  iframes alter the observer's effective visible region, so default side-by-side snapshots alone do not establish
  scroll tracking. The standalone reference confirms its active typography separately.
- Updated the standard docs example to compose Root asChild with Nav, providing the matching title/list spacing
  without duplicate root elements. The audit uses LocaleProvider for the primitive's RTL direction.

At the deliberately tight 86px link width, the long heading wraps to four lines in both. Added overflow wrapping
to arkcn links after Configuration extended 9px beyond its remaining RTL text space; long words now stay within
their column. This is an explicit narrow-layout difference from the untouched reference. OS-level reduced motion,
custom scroll containers, auto-scroll behavior, multiple simultaneous active headings, and full screen-reader
behavior remain follow-up gaps. The upstream dropdown and its responsive behavior were not audited. This is a docs
list comparison, not a same-name registry counterpart or full interaction certification.

Validation: `npm run check`, `npm run docs:build` (125 routes), `npm run audit:check` (224 protected reference files),
reference-integrity regression checks, and `git diff --check` pass. Evidence: `toc-audit.json`,
`toc-related-pattern.png`, and `toc-indicator.png`. Coverage is now 59 direct counterparts and 38 related-pattern
fixtures. Thirteen styled extensions still lack fixtures: App Shell, Canvas, Data Grid, Data Table, Frame, Gantt,
Highlight, Image Cropper, Kanban, Node Graph, Query Builder, Rich Text Editor, and Scheduler. Native porting stays paused.

## Highlight extension follow-up

The pinned registry has no inline Highlight component. Its docs CommandMenu SearchResults also renders plain
`item.content`, with no matching-text paint recipe. Added a clearly labeled plain-text baseline and untouched
shadcn Input/Label controls; no faux upstream Highlight was created. The reference fixture has zero component style
overrides and fifteen wrapper styles. Its plain text remains unmarked regardless of the query. This comparison
covers the query controls and text geometry; it does not claim that arkcn's mark colors have a shadcn counterpart.

- No production styling changes were needed. Marks retain a 6px radius, primary at 15% opacity, foreground text,
  and zero padding. Light/dark values resolve correctly, while surrounding typography passes through unchanged.
- Regular 14px/20px text and 18px/28px semibold italic text match their plain-text baseline's positions, dimensions,
  and wrapping. At 384px width the normal samples are one line and the larger sample two lines. At 252px they
  become two and three lines respectively, with no horizontal overflow. The sampled Arabic RTL text keeps the same
  layout and full text content, with two complete-word marks.
- The query fields match the existing Input recipe: 32px height, 10px radius, 4px/10px padding, and keyboard-visible
  3px ring. The reference focus border was sampled during its transition; its resulting token agrees with arkcn.
- For the default query, the first-match sample renders one lowercase mark, the case-insensitive all-match sample
  three marks including the substring in subcomponents, and whole-word matching two. Empty and absent queries
  render no marks without changing text. Uppercase queries respect the case-sensitive/case-insensitive settings.
  `.*`, `[ui]`, and `C++` are rendered as literal matches in the multiple-query sample rather than regex patterns.
- Marks have no animation or transition in normal or simulated reduced motion. Query changes update the marks
  directly without changing the sampled layout. Added docs clarification of matching defaults and per-mark styling.

Unicode whole-word segmentation, partial matches inside complex-script glyph clusters, IME composition, selection
preservation, long-text performance, alternate themes, and screen-reader announcement behavior remain unverified.
No production matching logic, source reference styles, or native components were changed.

Validation: `npm run check`, `npm run docs:build` (125 routes), `npm run audit:check` (225 protected reference files),
and `git diff --check` pass. Evidence: `highlight-audit.json`, `highlight-related-pattern.png`, and
`highlight-narrow.png`. Coverage is now 59 direct counterparts and 39 related-pattern fixtures. Twelve styled
extensions still lack fixtures: App Shell, Canvas, Data Grid, Data Table, Frame, Gantt, Image Cropper, Kanban,
Node Graph, Query Builder, Rich Text Editor, and Scheduler. Native porting stays paused.

## Frame docs-reference follow-up

Added the pinned `apps/v4/components/chart-iframe.tsx` as an untouched docs reference. The prepared file is byte-for-byte
equal to the fetched upstream source; its styles and component body are not adapted. The reference fixture has zero
component style overrides and three layout wrappers. Its iframe loads an independent reference page containing raw
Input, Label, and Button. The current fixture supplies only its own isolated stylesheet through Frame.head; neither
side imports the other's CSS. React portals and head injection remain Ark-specific behavior.

- Aligned the default outer appearance with ChartIframe: full width, no border or corner radius, and a 300ms opacity
  fade with cubic-bezier(0.4, 0, 0.2, 1). Ark starts the fade when portal content mounts; shadcn starts it on iframe load.
  The readiness events are different, and lazy loading remains a reference implementation detail. Consumers can still
  override frame classes and receive their onMount/onUnmount callbacks.
- Fixed a real internal style collision: Ark's original srcDoc contains an unlayered universal margin/padding reset.
  That reset outranked supplied Tailwind utility layers, zeroing the input/button padding and the 32px content inset.
  The default frame document now uses standards mode and puts that reset in the base layer. Explicit custom srcDoc
  is preserved and remains responsible for its own styles. This changes only arkcn's default document, not the reference.
- After the fix, sampled nested Input, Label, Button, and counter positions, colors, fonts, padding, and dimensions
  match. At 384px outer width the input is 320px wide; at 252px it is 188px wide. Both frames are 240px tall, with
  no horizontal overflow in the narrow fixture. Input padding is 4px/10px and button padding 0px/10px in both themes.
- Recorded real transitionrun traces in both renderers. Opacity progresses from 0 through intermediate values to 1,
  with matching 300ms animation timing/easing. The current capture reaches its endpoint at approximately 312ms and
  the reference at 302ms due to frame sampling. Simulated reduced motion gives 0s transitions and no transition trace.
  A CSS motion-reduce rule is also present in Frame itself; OS-level preference integration remains unverified.
- Typing inside each frame, tabbing to the button, and activating it with Enter work. Settled keyboard focus rings
  match at 3px. Reload remounts each frame and resets its field/counter. The theme-setting onMount callback is exercised
  by the fixture. These checks do not certify custom srcDoc changes, remote assets, StrictMode lifecycle behavior,
  CSP/sandbox configurations, iframe navigation, or cross-origin content.

Updated Frame docs to explain its entry styling, explicit stylesheet/theme setup, and layered reset. No parent CSS
is copied automatically by production Frame. The fixture's stylesheet copying is explicit test setup only.

Validation: `npm run check`, `npm run docs:build` (125 routes), final type/format checks, `npm run audit:check`
(227 protected reference files), reference-integrity regression checks, and `git diff --check` pass. Evidence:
`frame-audit.json` and `frame-related-pattern.png`. Coverage is now 59 direct counterparts and 40 related-pattern
fixtures. Eleven styled extensions still lack fixtures: App Shell, Canvas, Data Grid, Data Table, Gantt,
Image Cropper, Kanban, Node Graph, Query Builder, Rich Text Editor, and Scheduler. Native porting stays paused.

## Data Table core-composition follow-up

Added a related-pattern fixture using untouched Nova Table, Checkbox, Input, Button, and DropdownMenu components.
The composition follows the pinned shadcn tasks example (`data-table.tsx`, `data-table-column-header.tsx`,
`data-table-row-actions.tsx`, `data-table-toolbar.tsx`, and `data-table-pagination.tsx`). This is an independently
wired fixture, not the upstream TanStack table implementation: the original tasks example uses Radix/new-york
imports, while this comparison uses Base UI/Nova primitive APIs. Its seven component class overrides and thirteen
wrapper styles are disclosed. The header offset, input sizing, row-menu sizing, and navigation button sizing use
the task recipe's classes; pagination layout wraps for this fixture. No upstream primitive sources or reference
CSS were modified. The source link identifies the task recipe, not a nonexistent standalone shadcn DataTable.

- Fixed checkbox cell spacing in the shared Table parts. DataTable overrides the Checkbox root's `data-slot`,
  so the old Table selectors missed it, retained 8px trailing padding, and left the root inline. Selectors now
  recognize Ark's stable checkbox scope/part attributes as well. Removed the legacy 2px vertical translation
  from SelectAll/SelectRow. At 731.5px table width, the selection column shrinks from 104.96px to the reference's
  81.65px; all four measured column positions and widths match. Header and row checkbox positions match exactly.
- Matched the task recipe's -12px sortable-header margin and inherited menu icon colors. Removed ResetFilters'
  obsolete height/padding overrides: its Nova small button now matches at 28px high, 74.76px wide, with 10px
  horizontal padding. The search field remains 32px high and 150px wide at the tested breakpoints.
- Removed DataTable.Table's unconditional 576px minimum width. The 250px narrow fixture now fits its short
  content with matching column widths and no table-wrapper overflow; Table retains horizontal scrolling when
  intrinsic content needs more room. Dense tables can opt into a minimum width through className.
- Verified selected-row muted backgrounds, checked controls, typography, sorting-menu geometry (128 × 101px),
  and row-action menu geometry (160 × 101px) in light/dark comparisons. Preserved the user-approved primary/minus
  mixed checkbox, which intentionally differs from the reference. Ark's numbered page buttons and responsive
  pagination arrangement remain extensions, not claims of exact task-demo layout parity.
- Ascending sorting, next-page contents and disabled state, hiding a column, filtering to empty, reset, and a row
  copy action work. Both empty states span the remaining three columns at 96px high. Space selects a row;
  Enter opens its menu; Escape closes it and returns keyboard focus with matching 3px rings.
- Motion capture found an unintended transform-origin transition while Ark positioned its menu. Added
  transition-none to shared DropdownMenu Content/SubContent so only the intended CSS animation runs. Afterward
  the table's row menu records a single 100ms entry animation on both sides, with matching fade/scale/slide
  keyframes and the same final 160 × 101px bounds. Both exit with a 100ms animation and detach. The reference
  additionally records an outline-width transition during keyboard dismissal. Simulated reduced motion gives
  zero-duration transitions/animations and immediate opacity 1. Submenu positioning and OS-level reduced-motion
  behavior still need an interaction regression pass; neither was certified by this table fixture.

This pass does not yet cover DataTable.FacetedFilter, ViewOptions, PageSize, bulk actions, row reordering, RTL,
long/unbroken content, manual/server pagination, or large datasets. These remain explicit Data Table follow-ups.
The independent fixture uses local state; it is a styling/interaction baseline, not an engine equivalence test.

Validation: `npm run check`, `npm run docs:build` (125 routes), `npm run audit:check` (228 protected files),
reference-integrity regression checks, and `git diff --check` pass. Evidence: `data-table-audit.json`,
`data-table-related-pattern.png`, and `data-table-narrow.png`. Coverage is now 59 direct counterparts and 41
related-pattern fixtures. Ten styled extensions still lack fixtures: App Shell, Canvas, Data Grid, Gantt,
Image Cropper, Kanban, Node Graph, Query Builder, Rich Text Editor, and Scheduler. Native porting stays paused.

## Data Table advanced-controls follow-up

Extended the existing comparison with an Advanced controls mode, keeping the core fixture available. The reference
still imports untouched Nova primitives. Its filter, View menu, and page-size composition use the pinned tasks
recipes; the static grip uses the exact Button/icon classes from the pinned Base dashboard-01 DataTable DragHandle.
The reference grip does not implement DnD. Its bulk-action surface is an explicitly composed Popover/Button/Badge/
Separator baseline, not an upstream DataTable bulk-toolbar component. Positioning, keyboard reordering, filtered
selection, and the floating toolbar remain Ark extensions. The combined fixture now discloses 31 component
customizations and 29 wrapper styles. No reference component sources or CSS were edited.

- Matched facet boxes to the task recipe: 4px corners, input borders at full opacity when unchecked, primary
  checked surfaces, and muted 12px/16px monospace counts. Changed the selected-filter divider margins from 4px
  to 8px. The wide selected Todo trigger is now 140.57 × 32px on both sides with a 16px divider.
- Preserved the empty trailing indicator space that Nova's raw CommandItem renders. Before this correction,
  arkcn right-aligned counts and centered Clear filters while the raw reference reserved a trailing 16px icon.
  The final option rows, checkbox boxes, labels, count positions, trailing space, and Clear filters geometry now
  match exactly in the measured fixture (184 × 32px option rows inside a 200px popup). This is a real reference
  difference, not a reference stylesheet adjustment.
- Fixed Clear filters. Previously its item was outside the Command collection and its own handler conflicted
  with the root's toggle handler; clicking it left the Todo filter active. It now participates in the collection
  and dispatches one clear operation. Its internal value avoids collisions with supplied option values. Mouse
  activation and searching for Clear followed by Enter both restore all four rows. Unmatched search renders the
  empty state. Search resets on opening, so dismissal does not repaint a closing popup and reopening starts fresh.
- Moved the page-size label before the trigger and connected it through aria-labelledby. Both controls measure
  70 × 32px, use 10px corner radii and matching padding, and selecting 2 renders two rows. Preserved Ark's existing
  popup positioning behavior; the raw Base UI reference still uses its selected-item alignment.
- Verified the desktop View menu at 150 × 97px with 4px padding; hiding Status removes the column on each side.
  The original lg visibility breakpoint remains, so View is hidden in the ordinary side-by-side narrow panes.
- Replaced the custom 24px grip with the shared ghost Button recipe: 28px target, 12px icon, 10px corners, and
  muted foreground, matching the dashboard grip's default styling. The grabbed state remains an Ark affordance.
  Space/ArrowDown moves Write docs to the second row, keeps keyboard focus with a 3px ring, and announces the new
  position. Escape drops it. Pointer dragging then moves that same row after Review PR. Reordering is disabled by
  this fixture when filters are active, as required by the existing API contract.
- Centered the bulk toolbar's two 20px dividers, following the user's earlier FloatingToolbar preference. The
  untouched reference remains 6px above center. Corrected extra flex spacing in the selected-count phrase. Surface
  padding/gaps are 10px, height 52px, corner radius 10px, clear target 24px, and action targets 32px. The two count
  widths differ by less than 0.01px from text-layout rounding. Archive receives four selected rows; Delete stays
  disabled. ArrowLeft from Archive focuses Clear, skipping the disabled action. An open tooltip consumes the first
  Escape; a second Escape clears selection. This existing layered-dismissal behavior is recorded explicitly.
- Filter entry traces have identical 100ms fade/scale/slide keyframes and final 200 × 148px bounds. Bulk surfaces
  both animate for 100ms, but reference Popover placement includes a slide while FloatingToolbar uses its existing
  fade/scale. Simulated reduced motion removes animations/transitions. At a 700px outer viewport the current bulk
  toolbar is 250.83px wide, remains inside its frame, and retains 52px height. The reference is 285.13px wide and fits
  its frame through Popover collision positioning. Temporary viewport overrides were reset.

Remaining Data Table gaps: full RTL behavior, touch dragging, autoscroll/long lists, cross-page reordering policy,
manual/server pagination, changing columns/options during interaction, alternate themes, OS-level reduced motion,
and assistive-technology announcements beyond inspecting the live-region text. The filter intentionally retains
Ark's substring search rather than cmdk fuzzy ranking. The shared DropdownMenu submenu motion regression from the
previous pass is also still pending. The reference baseline is not an engine-equivalence or DnD-behavior test.

Validation: `npm run check`, `npm run docs:build` (125 routes), `npm run audit:check` (228 protected files),
reference-integrity regression checks, and `git diff --check` pass. Evidence: `data-table-advanced-audit.json`,
`data-table-advanced.png`, `data-table-filter-light.png`, `data-table-bulk-actions.png`, and
`data-table-advanced-narrow.png`. Coverage remains 59 direct counterparts and 41 related-pattern fixtures.
Ten styled extensions still lack fixtures: App Shell, Canvas, Data Grid, Gantt, Image Cropper, Kanban, Node Graph,
Query Builder, Rich Text Editor, and Scheduler. Native porting remains paused.

## Data Grid related-pattern audit

Data Grid has no direct shadcn counterpart. Added independent fixtures using the pinned dashboard Table/Input
recipes and untouched Nova Button, Checkbox, Input, Select/SelectGroup, and Table components. Fixed column widths,
viewport, seed data, and local editing state are fixture adaptations, disclosed in the audit page. Range selection,
pinning, resizing, fixed-height editing, and virtualization are Ark extensions, not upstream grid behavior.

- Aligned the header to 40px, default rows to 37px, header foreground, 14px/20px body typography, 50% muted hover,
  full muted row selection, and 96px foreground empty state. The sort trigger now uses the shared ghost/small Button:
  32px height, matching 75.16px fixture width, inherited icon color, and the standard keyboard focus ring. Table's
  collapsed borders place its sort trigger 0.25px lower and make its last row 36.5px; the virtual grid retains 37px.
- Used shared Input and Select controls for editing. Numeric editing matches the dashboard's 64 × 32px recipe,
  padding, right alignment, background, border, and 3px focus ring. Text editing uses the raw Input recipe; the pinned
  column divider accounts for its 1px smaller input width. Editing keeps fixed row heights, unlike a Table row that
  grows around an input. Removed the competing cell-focus ring while editing and initially highlights the selected
  Select option. Pointer selection and ArrowDown/Enter commit a new value; the next row receives cell focus.
- Separated the resize handle from the sort button. Pointer dragging changed Name from 160 to 200px without sorting;
  double-click restored 160px without sorting. Sorting still orders Ava, Mia, Noah. Text Enter and numeric Tab commit
  and move focus; Escape cancels edits. Checked row selection and the intentionally different mixed checkbox.
- Pinned cells use opaque row colors, including range selection, so scrolled text cannot show through them. At a
  1000px outer viewport, End scrolled the grid horizontally by 120px while pinned columns stayed at x33/x73. Shift+
  ArrowRight selects a two-cell range. With 60 rows, only 13 initially render; Control+End reaches row 60 with 12 rows
  mounted (indices 48–59). The reference renders all rows and does not claim equivalent virtualization or pinning.
- Select popups measure 144 × 92px with the standard group padding. Both use the existing 100ms fade/scale/slide
  animation. Restricted current Select's CSS transitions so focus-outline changes do not add an unintended animation;
  the untouched reference retains its transform-origin transition. Simulated reduced motion yields no animation and
  zero transition duration. Light/dark views and horizontally constrained layout were inspected.

Remaining Data Grid gaps: touch resizing, RTL pinning/resizing, custom/date editors, validation/error states, clipboard
permissions and multiline paste, resizing while scrolled, very large datasets, screen-reader navigation, alternate
fonts/themes, and OS-level reduced motion. Shared Select motion was checked through the grid; broader standalone
Select positioning/scroll-button regression remains pending. This fixture establishes visual baselines, not exact
engine equivalence.

Validation: workspace checks, docs build (125 routes), reference integrity (229 protected files / 101 disclosed
fixtures), integrity regression, and diff whitespace checks. Evidence: `data-grid-audit.json`,
`data-grid-related-pattern.png`, `data-grid-editors-light.png`, and `data-grid-narrow.png`.
Coverage is now 59 direct counterparts and 42 related patterns. Nine styled extensions still lack fixtures:
App Shell, Canvas, Gantt, Image Cropper, Kanban, Node Graph, Query Builder, Rich Text Editor, and Scheduler.
Native porting remains paused.

## Requested resize and sticky-column follow-up

- Data Grid resize handles now match Resizable's border/grip recipe: a full-height 1px `bg-border` divider,
  centered 4 × 24px rounded grip, 4px pointer hit area, and 1px keyboard focus ring. Removed the inset rule and
  hover-specific colors. Pointer drag changes 160px to 200px; double-click and Home reset to 160px. Shift+Right
  changes it to 170px without sorting. Left/Right uses 1px steps; the accessible value includes the pixel width.
- Data Table previously had no built-in sticky-column layout. Added `DataTable.Table stickyColumns` with left/right
  arrays of column IDs. Header and body parts share measured offsets. ResizeObserver tracks actual widths;
  header mutations recalculate offsets after visibility changes. Empty configuration removes pinning and observers.
  Keep each pinned group at the appropriate edge in caller-composed markup; no column order is silently changed.
- The current-only Sticky columns fixture explicitly labels this Ark extension. Reference fixtures, source components,
  and styles remain untouched. At 570.5px horizontal scroll, the two left headers/cells stay at x33/x81, and actions
  stay at x326.5. Increasing selection width from 48 to 96px changes the second left offset to 96px; hiding selection
  resets it to 0px. Toggling pinning off removes all pinned states. Pinned selected cells match the row's muted color;
  hover backgrounds are opaque blends, preventing scrolled text from showing through. Light and dark were checked.
- Added public docs, a sticky-column docs example, and type checks for the new option and forwarded table ref.
  Multi-row/grouped headers and spanning cells need custom layouts. Touch, RTL runtime, drag-reorder integration,
  and assistive technology testing remain follow-ups; physical left/right behavior is documented.

Validation: `npm run check`, docs build, diff checks, and reference integrity (229 protected files / 101 fixtures).
Evidence: `data-table-sticky-audit.json`, `data-table-sticky-dark.png`, `data-table-sticky-light.png`, and
`data-grid-resizable-handle.png`. Coverage remains 59 direct / 42 related patterns, with nine styled extensions
awaiting fixtures. Native porting remains paused.

## Grid border follow-up

Removed the selection column's vertical divider in both header and body. The user confirmed that vertical
resize/pinned-data-column dividers are useful, so those remain. Removed the grid's horizontal header separator
from its muted header and the final data row's bottom border. The last-row marker uses the actual data index,
not the final mounted virtual row, so intermediate virtual windows retain their row separators.

Checked the regular Data Table: its header row has one 1px border with the same color as the raw shadcn reference;
header cells add no border, and both omit the last body-row border. That matching Table styling remains unchanged.
The grid header omission is a visual adjustment for its muted sticky surface; the raw reference still declares
a 1px collapsed table-row border. Reference source/styles remain untouched.

## App Shell core layout and navigation

Added a related-pattern fixture built independently from pinned sidebar-07 page, team-switcher, and nav-user
recipes, using untouched Nova Sidebar, Avatar, Separator, Button, Collapsible, and DropdownMenu components.
The fixture uses reduced navigation data, a 12rem sidebar, a contained preview mode, and an optional responsive
mode. These composition/layout changes are disclosed. The theme control uses raw Button/menu primitives as a
related baseline; there is no shadcn App Shell component.

- Changed brand/user names from semibold to medium and removed the user's rounded-square avatar override.
  Header/sidebar brand and user targets match at 176 × 48px in the contained fixture, with 8px padding.
- Matched the sidebar-07 header: ghost sidebar trigger, -4px start margin, 8px gaps, centered 16px divider, and
  64px expanded height. It contracts to 48px when the desktop sidebar collapses to its 48px icon rail. Main
  content uses 16px side/bottom padding and no extra top padding. The fixed-header background/shadow behavior
  remains an Ark extension and was not exercised here.
- Replaced the scaled circular theme trigger with the standard 32px outlined icon Button, 16px sun/moon icons,
  and matching corners. Theme menus both measure 128 × 92px with 4px padding and 10px corner radii. Their
  recorded fade/scale/slide keyframes match at 100ms. Reduced-motion simulation removes animation and transitions.
  Pointer activation and keyboard activation select the preference; the fixture reports it without overriding
  the audit page's theme. Current Arrow/Home navigation and reference focused-item Enter were checked.
- Expanded Settings and selected General. Desktop collapsed navigation opens a functional flyout; Ark adds its
  group label, an explicit extension beyond the reference's basic menu. Collapsible content has no height
  animation in either primitive; the existing chevron rotation is retained. Full collapse-motion frame comparison
  and RTL chevron motion are still pending.
- At a 1000px outer viewport, both mobile drawers measure 349.5 × 638px with matching sidebar background.
  Selecting Inbox closes Ark's mobile sidebar and updates the main heading. Reference Escape dismisses its drawer.
  Both contained themes and desktop/mobile layouts were visually inspected; temporary viewport overrides were reset.

App Shell still needs a follow-up for search/command shortcuts, notifications (including unread/empty states),
top navigation/mobile menus, skip link, and fixed/fluid content scrolling. Team/account triggers are visual samples
without application-specific menus. Keep those gaps open rather than counting this fixture as a complete shell audit.

Validation: `npm run check`, `npm run docs:build` (125 routes), reference integrity (230 protected files / 102
fixtures), integrity regression, and diff checks pass. Evidence: `app-shell-audit.json`, `app-shell-related-pattern.png`,
`app-shell-light.png`, `app-shell-collapsed.png`, and `app-shell-mobile.png`. Coverage is 59 direct / 43 related patterns.
Eight styled extensions still lack fixtures: Canvas, Gantt, Image Cropper, Kanban, Node Graph, Query Builder,
Rich Text Editor, and Scheduler. Native porting remains paused.

## App Shell search and notifications follow-up

Extended the existing independent fixture with untouched Nova Button, Kbd, Command, Popover, and Item primitives.
There is no official shadcn notification-center counterpart: popup width/header/footer layout and search sizing are
explicit fixture compositions. The reference retains raw Item rows; Ark's unread tint, badge, dot, icon disc, and
compact list spacing are disclosed extensions. No upstream component styles were changed.

- Removed App Shell Search's custom muted surface, corner radius, hover color, and absolute-positioned icon/hint.
  It now inherits the outline Button recipe and uses flex layout with a truncated label. At the desktop breakpoint,
  both buttons measure 160 × 32px, with 10px corners and 10px horizontal padding; the keyboard hint is visible.
  In narrow previews the hint hides and the label truncates without overlapping adjacent icon buttons.
- Replaced the scaled circular notification trigger with the standard 32px ghost icon Button and 16px bell.
  Notification headings use 14px medium text, item titles use the Item recipe's snug line height, and timestamps
  use the shared 12px muted text size. Both popup surfaces use 10px corners and the same background/ring/shadow.
  At the narrow breakpoint both are 320px wide; Ark is 2px taller due to its intentional list gap.
- Bound NotificationsTitle to the Popover title primitive and explicitly associated NotificationsContent with that
  title ID. The lazy-mounted popup now exposes the accessible name "Notifications" on first open.
- Compared command dialogs at 423.5 × 176px with identical 14px corners, padding, background, and visible layout.
  Filtered to Inbox and selected with Enter in both; both update the page and close. No-results and Escape were
  checked. Shell Control+K and Command+K both open/focus search. Shortcut orchestration is Ark-only in this fixture.
- Notification mark-all, keyboard item activation, clear, and empty states work. Read state removes the unread
  count; mark-all becomes disabled. Escape returns focus to the notification trigger. Checked light/dark themes.
  Recorded both popup entrances: identical 100ms fade/scale/8px-slide keyframes. Simulated reduced motion gives
  animation:none and transition:0s in both. Exit-frame comparison and actual OS reduced motion remain unverified.

Validation: full `npm run check`, docs build (125 routes), reference integrity (230 protected files / 102 fixtures),
integrity regression, and diff checks pass. Evidence: `app-shell-controls-audit.json`, `app-shell-command.png`,
`app-shell-notifications-dark.png`, `app-shell-notifications-light.png`, and `app-shell-notifications-empty.png`.
App Shell top navigation/mobile menu, skip link, fixed/fluid scrolling, and full collapse-motion checks remain open.
The eight unrepresented styled extensions remain unchanged; native porting stays paused.

## App Shell navigation, skip link, and scrolling follow-up

Compared top navigation using the ghost/small Button composition from pinned
`apps/v4/components/main-nav.tsx`, adapted to the unchanged Nova Button rather than importing its New York
Button. Responsive visibility and the mobile DropdownMenu are explicit fixture composition. The fixed-height
scroll preview and optional width cap are also fixture layout, not an official shadcn shell implementation.
The scroll check exposed an unpositioned theme-button wrapper in the reference fixture: its absolute moon icon
escaped the scrolling area. Added relative positioning to that fixture button, a disclosed composition correction;
the protected upstream Button and stylesheet remain unchanged.

- Top navigation uses the ghost/small recipe and gap-0 nav spacing. Both Overview links measure 78.055 × 28px,
  with 10px horizontal padding, 8px corners, and 12.8px medium Geist text. Active links expose aria-current=page.
  Keyboard Enter updates the active page. Removed the mobile trigger's extra md-only 28px size override;
  it consistently uses the standard 32px outline icon button below lg.
- Both mobile menus measure 128 × 64px with 4px padding and 10px corners. Keyboard selection updates the page
  and closes the menus. Light and dark surfaces were inspected; simulated reduced motion removes their animation
  and transitions. Normal-motion traces are saved for review.
- SkipLink now uses the shared primary Button styling and appears at the viewport's start/top inset when focused.
  Tab reveals it, and Enter focuses the actual main content. The default id=content and tabIndex=-1 now belong
  to Main. Content renders a div by default instead of nesting a main landmark around Main; asChild still works.
  Documented unique IDs for multiple shells and added rendered semantic/active-link regression checks.
- Fixed Main now fills the available height with min-height:0 and owns vertical overflow. Header observes that
  main scroller and its ancestors through captured scroll events, instead of only document scrolling. It ignores
  unrelated descendant scroll areas. In the 360px fixture, both main areas are 296px tall with 1452px scroll
  height and a 1156px endpoint. Ark's header stays at y77 while scrolling, enables its shadow below the top,
  and clears it when Home returns to the top. The shadow remains an Ark extension; reference behavior/styles
  are not modified to reproduce it. The main focus target avoids an unintended browser-default outline.
- At a 1508px content-container width, capped Main measures 1280px and fluid Main measures 1508px in both
  fixtures. Temporary wide viewport overrides were reset after measuring the responsive behavior.

Validation: `npm run check`, docs build (125 routes), reference integrity (230 protected files / 102 fixtures),
integrity regression, and diff checks pass. Evidence: `app-shell-layout-audit.json`, `app-shell-skip-link.png`,
`app-shell-navigation-light.png`, and `app-shell-scrolling.png`. Full sidebar-collapse motion, RTL, OS-level
reduced motion, and external ancestor/document-scroller runtime cases remain unverified. Coverage remains
59 direct / 43 related patterns; eight styled extensions lack fixtures. Native porting remains paused.

## App Shell variant matrix

Expanded the existing fixture with variant (sidebar/inset/floating), collapse (none/icon/offcanvas), and direction
controls. Controls are outside the shell and inset away from the fixed desktop rail; they no longer overlap mobile
drawers. RTL cases use Ark LocaleProvider and Base UI DirectionProvider, with right-side sidebars. Added independent
motion observers for the sidebar gap, panel, and header so traces compare the same part, rather than whichever
transition starts first. The upstream reference sources and CSS remain unchanged.

- Exercised expanded/collapsed desktop states for all three variants and both responsive collapse modes in LTR
  and RTL (24 state cases), then all three collapse modes including none with simulated reduced motion in light
  theme (36 state cases). None intentionally bypasses variant decoration in the pinned Sidebar and arkcn alike.
  Sidebar widths are 192px expanded and 48px for the basic icon rail. Floating/inset icon mode uses a 64px gap
  and 66px padded panel, matching the upstream recipe. Offcanvas closes the gap to zero and moves the 192px
  panel fully off its physical edge. Floating corners/ring/shadow and inset content corners/margins were inspected.
- Recorded collapse and expansion for every variant/collapse/direction combination. Gap/panel keyframes and timing
  match: 200ms linear; icon-mode header height changes 64px to 48px with the same 150ms transition. Offcanvas
  leaves the header at 64px. Reduced-motion simulation gives zero transition duration throughout all 36 cases.
- Tested 12 mobile combinations (three variants × icon/offcanvas × LTR/RTL) with identical drawer geometry,
  background, border, and direction: 349.5 × 638px at the test viewport. Escape dismisses from focused drawer
  controls. Recorded normal-motion entrance and exit for all three variants in both directions: 200ms ease-in-out
  opacity and a 40px horizontal slide. Base UI uses opacity/translate transitions; Ark uses matching keyframe
  animations. The implementation mechanisms differ, so their raw animation objects are not claimed identical.
- Fixed right-side inset spacing: the expanded content now keeps its outer margin and removes the margin next
  to the sidebar, mirroring the left-side layout. Collapsed content keeps both 8px margins. The pinned reference
  has a hard-coded left margin; that RTL defect is retained in the reference and explicitly documented.
- Fixed the icon-collapsed navigation flyout to open toward the content in RTL and mirror its chevron. Verified
  left-start placement, a 180-degree closed chevron, and selection of General. Expanded Settings turns its
  chevron down when open. Current sample footer spacing now uses logical margin; upstream sample text-left/ml
  classes remain visible RTL differences rather than being rewritten to hide them.

Validation: full workspace checks, docs build, reference integrity (230 protected files / 102 fixtures), integrity
regression, and diff checks. Evidence: `app-shell-variant-matrix.json`, `app-shell-floating-desktop.png`,
`app-shell-inset-rtl.png`, and `app-shell-mobile-rtl.png`. This closes the requested variant/RTL/animation matrix;
OS-level reduced motion, screen-reader runtime behavior, and arbitrary consumer layouts are not covered by these
fixtures. Coverage remains 59 direct / 43 related patterns. Eight other styled extensions still lack fixtures;
native porting remains paused.

## Canvas control audit

Added an isolated related-pattern fixture using the protected Button, ItemTitle, and Resizable components.
Shadcn has no Canvas recipe: the reference deliberately shows its controls without copying arkcn's node cards,
drop surface, or layout behavior. Its wrapper layout and three component overrides are disclosed by the harness.

- Palette items now use shared outline Button styling: 32px height, 14px medium text, 10px corners, matching
  light/dark surfaces and borders, and no extra shadow. Drag handles use ghost/icon-xs styling: 24px square,
  12px icons, 8px corners, and the standard focus treatment. Muted drag-icon color is explicit in both fixtures.
- Node titles now match ItemTitle's 14px medium text and 19.25px line height instead of muted 12px text.
- Resize handles now use the Resizable border color, 1px divider, and centered 4 × 24px rounded grip with a
  4px hit area, replacing the thicker pill and custom primary hover color. Divider height follows its container.
- Inspected light/dark surfaces and simulated reduced motion. Recorded the normal Button focus transitions:
  150ms with cubic-bezier(0.4, 0, 0.2, 1) in both frames. Keyboard pick-up and rightward reorder, Escape,
  clear/empty, Enter to add a block, and pointer resizing were exercised. A resize changed the first two
  node widths from 215.75/215.75px to 257.3125/174.1875px and cleared the resizing state on release.
- Node cards, drop indicators, selection/grabbed colors, percentage overlays, and action-reveal behavior remain
  Canvas-specific. This pass does not certify every drag edge, touch/RTL layout, screen-reader output, or
  operating-system reduced-motion behavior. Canvas resizing remains pointer-only; keyboard resizing is an
  existing accessibility gap, unlike the reference Resizable control.

Validation: full workspace checks, docs build, reference integrity, integrity regression, and diff checks.
Evidence: `canvas-audit.json`, `canvas-dark.png`, and `canvas-light.png`. Coverage is now 59 direct / 44 related
patterns (103 fixtures). Seven styled extensions remain without fixtures: Gantt, Image Cropper, Kanban,
Node Graph, Query Builder, Rich Text Editor, and Scheduler. Native porting remains paused.

## Canvas minimal layout follow-up

The user preferred the plain reference composition. Removed default node backgrounds, borders, shadows,
and the tinted/dashed outer drop surface from Canvas itself. Node actions now stay visible. Header spacing
comes from the node's gap, so a header-only node is 48px tall without a trailing margin. Removed decorative
content placeholders from the audit and documentation examples. No reference files or styles were changed.

The canvas retains its open drop area, targeted drop tint, insertion indicators, resize divider, grabbed/selected
rings, and width overlay. Node rings are inset so the unpadded scrolling surface does not clip their feedback.
The existing inter-node gap remains available for insertion indicators. Verified dark/light appearance and
keyboard pick-up/reorder/release, removal, and pointer resizing after the simplification. Full workspace checks,
docs build, reference integrity, and diff checks pass. Evidence: `canvas-clean-dark.png`, `canvas-clean-light.png`.

## Canvas dashed boundary follow-up

At the user's request, added a subtle dashed border around Canvas.Area to define the layout boundary.
The interior and nodes remain transparent, with persistent actions and the existing interaction feedback.
Reference styles remain untouched. Inspected the updated dark-theme fixture and regenerated the registry.

## Canvas insertion indicator follow-up

The unpadded scroll surface clipped insertion indicators positioned outside the first node. Added 8px of
canvas padding so the default 12px gap's indicators remain inside the scrolling boundary, including the
first column and first row. Replaced the primary line-and-circle marker with a simple 2px muted insertion
line. The default indicator stays outside the content and does not intercept pointer input.

Added drop tracing and an explicit edge-preview control to the current audit fixture only. Verified all four
preview edges lie inside the canvas boundary and have no circular pseudo-element. A real palette drop at the
left of the first node inserts Paragraph before Heading. Reference styles remain unchanged. Evidence:
`canvas-drop-left.png` and `canvas-drop-edges.json`. Custom caller-supplied indicator gaps or area padding still
need to be coordinated by the caller; these checks cover the defaults.

## Gantt control audit

Added an independent related-pattern comparison using unchanged shadcn Button and Table components.
There is no upstream Gantt recipe; the reference shows toolbar/row styling and progress as text, without
copying arkcn's date grid or bars. The fixture has no component style overrides, and discloses four wrapper styles.

- Toolbar controls match the reference: 28px zoom buttons with 16px icons and 8px corners; Today is 28px high
  with a 14px icon and 12.8px medium text. Light/dark styles and simulated reduced motion were inspected.
- Row labels now use Table's 8px horizontal padding and 14px regular text. Row hover uses muted/50, with a
  matching opaque mix for sticky labels. Added Table's color transition and removed the last row's bottom border.
  Gantt's explicit 40px row height remains a timeline feature; reference table body rows measure 37px.
- Bar keyboard focus now uses the shared 3px ring and ring-colored border. Bar surfaces, progress overlays,
  resize grips, milestones, dependency arrows, date header, and Today marker remain timeline-specific.
- Zoom buttons now disable at the configured limits. Both fixtures reach disabled states at 8px and 160px/day,
  with 50% opacity. Added rendered regression checks with custom 12/48px limits and an enabled midpoint.
- Fixed the documentation example's progress values: the API expects fractions, not percentages. Research,
  Design, and Build now render widths of 100%, 60%, and 10%. Documented this contract on the prop and page.
- Exercised keyboard movement, both keyboard resize endpoints, Escape restoration, pointer move and end resize,
  empty state, and read-only mode. Read-only removes bar tab stops and all six resize handles. Keyboard changes
  moved Oct 12–16 to Oct 13–17, extended to Oct 13–18, moved the start to Oct 14, then Escape restored Oct 12–16.
  Pointer movement and end resize produced Oct 14–19. Toolbar CSS transition traces use 150ms in normal motion.

Validation: workspace checks, docs build, reference integrity and diff checks. Evidence: `gantt-audit.json`,
`gantt-light.png`, and `gantt-dark.png`. This does not certify touch, RTL, arbitrary date ranges, dependency routing,
all pointer hit regions, or OS-level reduced motion. The audit toggle disables CSS motion; programmatic smooth
scrolling is outside that simulation. Coverage is 59 direct / 45 related patterns (104 fixtures). Six styled
extensions remain without fixtures: Image Cropper, Kanban, Node Graph, Query Builder, Rich Text Editor, and Scheduler.
Native porting remains paused.

## Gantt header and final-row follow-up

The month/year heading was absolutely stretched across both 28px header tiers, putting its label on their
boundary. Restricted it to the top 28px tier so the month and week/day labels occupy separate rows. Restored
the final task row's bottom border at the user's request: the timeline needs a closing rule above its empty
scroll area, even though the reference Table omits its final border. Reference sources remain unchanged.

## Gantt header polish

Moved the Today badge from the body into its matching header period, keeping the vertical date marker on the
body. Week/month cells keep their date text when space permits; narrow day cells show the badge with the full
date in its title. Header exposes `today` for matching a custom Gantt.Today date and `label` for customizing the
default Task heading. Header and body now have min-width:100%, so row borders and header tier rules extend
through the viewport when the date range is narrow, without changing the date scale or bar coordinates.

Verified month/week/day layouts: header, body, and row widths match, and Today stays inside the header with no
badge in the task body. Added rendered regressions for all three scales, an out-of-range date, a custom heading,
and the body marker. Workspace/component checks, docs build, reference integrity, and diff checks pass.
Reference sources are unchanged. Evidence: `gantt-header-polish.json` and `gantt-header-polish.png`.

## Gantt plain header follow-up

At the user's request, replaced the Today badge with a subtle underline on the current date/period, keeping
an accessible Today annotation and the exact date in the title. Date text no longer disappears at narrow widths.
The header now uses the unchanged TableHead reference's foreground color, 14px medium typography, 8px horizontal
padding, and 40px main tier. A muted 12px month/year caption occupies a separate 24px upper tier. Removed the
filled header surface, intermediate rule, and vertical cell borders; retained the sticky task-column divider,
full-width bottom rule, and final task-row border. Reference sources remain untouched.

## Gantt header dividers and current-period follow-up

Restored the tier rule and vertical header-cell dividers at the user's request. Month/year labels now inherit
exactly the same 14px medium foreground typography as the date headings, with the existing separate tiers.
Replaced the current-period underline with a muted/50 cell background; no badge or additional accent color.
The date tooltip and accessible current-period annotation remain. Reference styles are untouched.

## Gantt sticky month heading follow-up

Increased the month/year tier from 24px to 40px and its label from 14px to 16px medium text; the date tier
remains 40px with 14px medium text. The task-column header is now 80px tall to match both tiers. Each period
contains a horizontally sticky label positioned beside the task column and constrained by its own period's
bounds. Removed overflow clipping from the period wrapper; long labels truncate within their own span.

Extended the audit range into November to exercise the month transition. At 36px/day, scrolling from 353.5px
to 575.5px kept October at the task-column edge. At 121.5px/day and the range end, October moved out and
November occupied that same edge. Both period rows measure 40px. Evidence: `gantt-sticky-month.json`,
`gantt-sticky-month.png`, and `gantt-sticky-month-scroll.png`. Reference styles remain unchanged.

## Gantt numeric day labels

Retained numeric-only day labels at every zoom level, per user preference. Weekday initials no longer appear
when zooming beyond 40px/day. Full date tooltips, the current-date treatment, and sticky month labels remain.

## Image Cropper related-pattern audit

Added independent raw shadcn Button, Slider, and Label controls. Shadcn has no Image Cropper;
its viewport, shade, grid, circular selection, and resize geometry are explicitly Ark extensions.
The reference fixture has zero component styling overrides. Reference source files are unchanged.

Fixed side handles to use Ark's actual `data-position` attributes instead of nonexistent `data-axis`
attributes. Side grips now measure 4×16px or 16×4px; corner handles use the Slider's 12px white thumb,
ring border, and 150ms color/shadow transition. Handles have a minimum 12px hit region. Fixed crop
areas hide resize handles; they still support image panning and zoom and are not a disabled cropper.
Added a keyboard selection ring while preserving the crop shade. Replaced ineffective SVG stroke
styling on HTML grid elements with 1px borders, clipped inside the default circular selection.

Verified dark/light toolbar metrics against the isolated reference: 28px icon buttons, 16px icons,
8px radius, matching colors/borders/type. Slider thumbs match 12px sizing, white fill, ring border,
and 150ms color/shadow transitions. Reduced-motion simulation makes those transitions zero-duration;
crop movement itself stays immediate, avoiding lag behind the pointer.

Browser checks: Shift+Right moved x32→42; Alt+Right resized width256→257. Pointer movement added
10px to x/y, and an east-edge drag increased width256→266. Zoom reached 5, rotation reached90°,
flip toggled, and Reset restored 1/0°/original. Circle mode produced a square circular crop; fixed mode
hid all eight handles and ignored keyboard resizing. Grid clipping was checked visually in circle mode.
A deterministic local calibration image avoids remote image failures in the fixture.

Workspace checks, docs build, protected-reference integrity, and integrity regression checks pass.
Evidence: `image-cropper-audit.json`, `image-cropper-light.png`, and `image-cropper-dark.png` in the
external style-audit evidence directory. Touch/pinch targets, screen-reader announcements, rotated
export accuracy, cross-origin export, and OS reduced-motion behavior remain unverified; no native
porting resumed. Five styled extensions still need fixtures: Kanban, Node Graph, Query Builder,
Rich Text Editor, and Scheduler.

## Gantt empty-state positioning follow-up

`Gantt.Empty` previously centered its message across the entire timeline width, which could place it
offscreen at high zoom. The viewport now establishes an inline-size container; the empty state uses
that visible width and sticks to the viewport's left edge below the header. Its background keeps grid
and Today lines from crossing the message. Verified at 121.5px/day with a 3287px timeline and an 831px
viewport: horizontal positions 0, 1430, and 2456 all keep the empty surface at x1 relative to the viewport,
831px wide. Evidence: `gantt-empty-visible.json` and `gantt-empty-visible.png`.

Retained Image Cropper's round corner handles after the user's preference for dots over the trial
Resizable-style grips. The original side grips, grid fixes, and keyboard focus treatment remain.
Protected shadcn reference sources and styles are untouched.

## Image Cropper edge-handle clipping follow-up

The viewport must clip the image and crop shade, but it also clipped handles centered on its outer
edges. Handle positions now preserve a 12px clearance at those limits, using the crop and measured
viewport bounds; ordinary interior crops retain their original edge positions. This leaves room for
the 12px dot, its 3px hover ring, and the viewport's rounded corners without altering the crop itself.
Consumer handle styles remain overridable.

Verified all eight handles inside a full 320×288 crop: corner centers sit 11–13px inside the viewport.
Dragging the inset northwest dot by 20px changed the crop from 0/0/320/288 to 20/20/300/268.
Reset restores ordinary zero insets, and circular crops at the top-left boundary retain the same
clearance. Evidence: `image-cropper-clipping.json` and `image-cropper-clipping.png`. Reference styles
are unchanged.

## Kanban related-pattern audit

Added raw shadcn Item (outline), Button, and Badge references with zero component style overrides.
Shadcn has no Kanban counterpart. The board's muted columns, opaque card surface, three-line description
limit, dashed empty/drop surfaces, and reorder behavior are explicitly arkcn extensions.

Aligned card borders, radius, padding, gap, no-shadow treatment, 100ms color transitions, and focus
border/ring with Item. Titles use 14px medium/snug type; descriptions use 14px normal/21px leading.
Column titles now use medium weight; counts inherit the unmodified secondary Badge sizing. Handles
use the shared ghost icon-xs Button (24px control, 12px icon), including disabled and focus states.
The footer uses the normal ghost Button foreground. Added 4px top clearance for the first card's ring.

Card and column handles now respect their parent's `draggable={false}`; card keyboard movement is
also guarded. Rendered regression checks cover both parent states and an explicit child disabled=false.
Clarified the existing keyboard behavior: Escape releases the grab; moves already applied are not undone.

Drop slots now use a single neutral dashed border. Column drop lines use the same quiet 2px treatment
as the accepted Canvas indicator, with no terminal marker. Board padding contains the first-column line;
its measured left inset is 4px. A labeled fixture preview exposes this styling without faking a live drag.

Browser checks passed for keyboard in-column reorder, cross-column card movement, and column reorder;
all four handles disable and dim to 50% in read-only mode. A pointer drag moved Write the docs into the
empty Done column. Measured title/description typography, card border/radius, and Button dimensions
match their isolated references; card backgrounds and board layout remain extensions. Normal card
color transitions measure100ms; reduced-motion simulation removes them. Light/dark screenshots and
`kanban-audit.json` record the checks; `kanban-drop-preview.png` records the indicator/slot treatment.

Touch dragging, long-board auto-scroll, cross-board keyboard focus isolation, screen-reader output,
and frame-by-frame native drag-preview motion are not certified by this pass. Reordering remains
immediate; no layout animation was added. Four styled extensions still need fixtures: Node Graph,
Query Builder, Rich Text Editor, and Scheduler. Native porting remains paused.

## Kanban design cleanup

At the user's request, simplified the board into open columns with a single header rule instead of
nested bordered, filled column containers. Column headers and footer actions align across the board;
card spacing is consistent and the existing Item-based card typography/borders remain. Column grips
use a quieter muted foreground until hover. Empty columns use a plain centered label and hide it while
a real card landing slot is active. Drop targets retain a subtle muted background during dragging.
These board composition choices are arkcn-specific; the shadcn reference remains untouched.

## Kanban footer and header refinement

Removed the column header divider and the AddTrigger full-width default at the user's request.
The footer button now sizes to its contents; consumers can still opt into `w-full`. Card borders
remain intact. The shadcn reference is unchanged.

## Node Graph related-pattern audit

Added an isolated raw shadcn Item outline/typography and Button reference with zero component
style overrides. Shadcn has no Node Graph component; the graph surface, header divider, opaque
node background, compact port labels, connections, selection, controls enclosure, and minimap
remain explicit arkcn extensions.

Removed elevated node/drag shadows and selected-edge glow. Node titles now use Item's 14px
medium/snug typography; subtitles use its 14px normal/21px muted description treatment. Node
focus and selection use a neutral 3px ring. Header fill is removed. The reset-zoom control uses
the shared ghost/sm Button recipe, including focus and disabled styles. Zoom-in/out disable at
the configured bounds, with rendered regression coverage at 25%, 100%, and 200%.

Fixed output pins appearing inside their labels: pins now explicitly order to their side's edge,
independent of whether consumers place the pin before or after its label. Existing port geometry
and the 150ms hover scale are preserved. Node border/color transitions match Item's 100ms timing;
position transforms remain immediate for dragging. Reduced-motion simulation measures 0s.

Browser checks covered light/dark presentation, matching title/subtitle metrics, zoom limits,
reset and fit, empty state, keyboard movement, and a pointer move from (40,60) to (80,40).
The fit-view screenshots use 81% zoom at the tested narrow panel width; typography measurements
were taken at 100%. Evidence: node-graph-light.png, node-graph-dark.png, node-graph-audit.json.
Full checks, docs build, and reference integrity tests pass: 235 protected files, 107 fixtures.

Touch gestures, keyboard creation of connections (pins currently are not focusable), connection
rerouting, exec pins, screen-reader output, minimap pointer navigation, and operating-system
reduced motion remain unverified. This is a styling pass, not full interaction certification.
Three styled extensions remain: Query Builder, Rich Text Editor, and Scheduler.

## Node Graph Unreal-inspired pins

At the user's request, replaced the larger border-straddling pins with compact inset shapes:
10px data circles with a 1.5px outline and 12px execution arrows. Both use a 16px pointer target.
Disconnected execution pins now have an actual hollow outline instead of a dim filled silhouette;
connected pins fill with their current color. The node surface masks hollow centers. Hover scale
is restrained to 110%, valid/invalid targets retain their scale/color feedback, and reduced motion
disables the transform transition. Shapes remain right-pointing on both sides, like the supplied
Unreal reference. Existing type colors are consumer-controlled.

The audit example now includes linked and unlinked execution and data pins plus a working
onDisconnect handler. Browser verification removed an execution link with Alt-click and reconnected
it by dragging, confirming the layout store tracks the new inset centers. Type checks, lint, docs
build, and reference integrity checks pass. The shadcn reference is unchanged.

## Node Graph dark surface refinement

At the user's request, nodes use the darker background token in dark mode instead of the raised
card token. Hollow data and execution pin centers match that surface; connected fills retain their
type colors. Light mode keeps the card surface. Browser computed colors confirm dark nodes and
hollow centers use oklch(0.145 0 0). Evidence: node-graph-dark-surface.png.

## Node Graph execution-arrow refinement

Replaced the blocky nested CSS polygons with one narrower SVG path and a consistent 1.25px
rounded outline. Disconnected execution pins use no fill; connected pins fill the same path.
This removes the mismatched inner cutout while preserving the pointer target and connection geometry.
Custom children and asChild remain supported. Evidence: node-graph-execution-arrow.png.

## Query Builder related-pattern audit

Added raw shadcn Select, Input, and Button references with zero component style overrides. There is
no shadcn Query Builder counterpart; recursive group surfaces, guide lines, hover-revealed actions,
natural-language summaries, incomplete rules, and the empty message remain arkcn extensions.

Removed forced medium weight from match/field selects, muted operator/group-action text, and the
custom destructive remove-hover color. Field, operator, and option selectors now use the standard
32px size alongside the unmodified Input height and responsive typography. Match retains the native
small Select size. Input widths remain appropriate to the value type. Measured field and input height,
borders, radius, font, and surface colors match isolated upstream controls. Action-button line-height
inherits the Query Builder's text-sm context (18.29px versus 19.2px in the standalone reference);
control height, width, text size, weight, and color match.

Browser checks covered number editing and summary updates, all/any switching, adding/removing a
nested group, text/date-range/boolean/multiple-option editors, empty and incomplete rules, and disabled
controls. All 23 controls in the expanded fixture disable and dim to 50%. Both themes were inspected.
Popup animation uses the shared 100ms entry; action reveal uses 150ms opacity. The accepted below-trigger
Select placement remains different from shadcn's aligned-item popup. Reduced-motion simulation is
checked separately from operating-system preferences.

Full checks, docs build, and integrity checks pass. Evidence: query-builder-light.png,
query-builder-dark.png, query-builder-disabled.png, query-builder-audit.json. Protected reference
sources remain intact. Native date-picker chrome, touch-only discoverability of hidden rule actions,
maximum-depth interaction, custom renderers, RTL, and screen-reader output are not certified.
Two styled extensions remain: Rich Text Editor and Scheduler. Native porting remains paused.

## Query Builder design refinement

At the user's request, simplified the composition toward the plain upstream reference rows. Removed
root guide lines, row highlight backgrounds and padding, and footer indentation. Rule removal stays
beside its inputs at a quiet 60% opacity, becoming fully visible on hover/focus. Nested groups keep
one solid left border and indentation, with no enclosing dashed card or tint. Empty content is plain
text. Reference sources and fixture styles remain unchanged.

Date ranges use an equal-column grid that wraps as one unit and stays within the available width.
Their native color-scheme follows the theme, fixing dark-mode calendar icon contrast. Browser checks
measure equal 142px date inputs on one line. Text and number fields provide concise unfinished-value
placeholders; option selectors say “Choose a value…”.

Summary text is muted and regular weight. Nested multi-condition groups explicitly say “all of” or
“any of” with parentheses; incomplete rules are counted on a separate line. Entirely unfinished
queries say “No complete conditions yet” instead of appearing to apply a complete filter. Regression
checks cover nested grouping, omission by pruneQuery, and incomplete-summary wording. Existing full
checks passed; final component checks and docs build passed after the visual cleanup. Evidence:
query-builder-clean.png. Native date popover behavior and touch devices remain unverified.

## Query Builder nested cards

At the user's request, nested groups now use a rounded card surface with a solid border and 12px
padding. Plain condition rows, inline actions, and the unboxed root remain. This replaces the left-guide
presentation from the preceding refinement; the reference is unchanged.

## Query Builder deeper nesting

Refined depth styling at the user's request: depth 1 is a padded card, depth 2 is a transparent
subtle bordered group, and depth 3+ uses horizontal separators with no further horizontal padding.
All groups use “Match”; group removal aligns to the right by default. Local add actions remain
inside each group. A Deep groups fixture exercises three levels and the default maxDepth boundary.
Browser measurements confirm body left positions of 32/45/58/58px across root and depths 1–3;
deeper controls keep their width. Adding a condition at depth 3 changes only that group's rule list.
Reference styles remain untouched. Evidence: query-builder-deep-groups.png.

## Query Builder single-card hierarchy

The user rejected the remaining stacked-card appearance. Only depth 1 now has a card outline and
fill. Depth 2 uses a left guide without rounded or surrounding borders. Depth 3+ uses only a top
divider. Inner surfaces stay transparent and horizontal indentation remains capped. This supersedes
the bordered second level and paired separators described above.

## Query Builder card-free groups

The user rejected cards entirely. Removed the final outer card fill, rounded outline, and surrounding
padding. Nested levels 1 and 2 now use only a subtle left guide and 12px start padding; deeper groups
retain the single header divider and capped indentation. This supersedes the single-card hierarchy.
Reference sources remain unchanged. Evidence: query-builder-no-cards.png.

## Query Builder readable hierarchy and input typography

The user found deep groups difficult to follow and date text visibly mismatched. Inspection showed
Input's responsive default was 16px inside the narrow audit iframe while Select stayed 14px; the date
segments already inherited Geist, so this was not a foreign font override. Query Builder now sets
all value editors to 14px/20px at every width. This is an intentional composition-level size choice;
raw shadcn Input and the protected reference are untouched.

Replaced capped indentation and mixed divider styles with continuous left guides and 16px indentation
at every nested level. Headers show positional labels (Group 1, Group 1.1, etc.). The docs and audit
compositions put nested add actions immediately after their own header, removing the confusing stack
of action rows at the bottom. No cards or background fills were restored. GroupHeader's asChild branch
still preserves the supplied child; default headers obtain their label from their enclosing group.

Browser checks confirm matching computed date/text/number typography and correct renumbering after
adding Group 1.2 then removing Group 1.1. Full checks and docs build pass. Deeply nested layouts can
wrap controls at narrow widths rather than flattening ancestry; mobile and screen-reader review are
still outstanding. Evidence: query-builder-date-type.png and query-builder-readable-groups.png.

## Query Builder: separate connected sections

The latest user direction supersedes the numbered hierarchy and nested-card experiments above.
Each logical group now has a `GroupSection` card containing only its local controls and conditions.
Child groups render below it, outside the card, connected with elbow lines. There is no enclosing
root card, no nested card containment, no collapse control, and no AND/OR switch. The All/Any dropdown
remains. Add condition/Add group actions sit in the local footer; trash icon buttons align right in
headers and condition rows. `RuleList` supplies subtle dividers, and wrapped editors reserve space
for their trash action.

The docs example and audit fixture use the same composition. Verified All/Any changes, adding and
removing conditions, removing a deep group, and disabled controls (21 of 21 buttons disabled in the
checked fixture). DOM inspection confirmed zero cards inside cards. Date inputs retain 14px/20px
typography in the light fixture. Light and dark layouts were inspected; deep groups remain expanded.
Reference source and styles remain untouched: 236 protected files and all integrity tests pass.
Full checks and docs build pass (the existing large-chunk build warning remains).
Evidence: `query-builder-connected-cards-light.png`. Touch, RTL connector rendering, and native date
picker interaction remain unverified.

## Query Builder: table-style conditions

The user requested unwrapped, non-scrolling conditions, then borderless editors similar to the data grid.
Condition rows now use shared proportional field/operator/value columns plus a fixed 32px action column.
Inputs and select triggers are transparent and borderless at rest, with hover feedback and visible keyboard
focus. Row dividers remain. All/Any group headers and separate connected cards are unchanged.

Date cells show a compact summary and open a popover with full native date editors, avoiding clipped inline
ranges. Keyboard editing changed the stored start date and refreshed the summary. Incomplete, invalid, and
reversed date ranges render without Intl errors (component coverage added). Browser measurements confirmed
32px rows, matching columns within each section, and no horizontal overflow at the checked 500/516px row
widths. Light/dark screenshots: `query-builder-table-light.png`, `query-builder-table-dark.png`.
Full checks and docs build pass; protected shadcn references remain intact. Very narrow layouts may truncate
cell labels; touch-native date-picker interaction remains unverified.

## Query Builder: connector attachment correction

Moved connector trunks away from card corners: child cards indent 32px, and their shared trunk sits
16px inward from the parent card's leading edge. Branches now meet the 27px header center rather
than the previous 16px offset. The first segment starts at the parent bottom edge across the 16px
gap; the last segment stops at the final child's header. Checked two sibling groups in the live
fixture: branch y positions exactly matched both header centers. Full checks pass. Reference styles
remain untouched. Evidence: `query-builder-connector-alignment.png`.

## Query Builder: content-sized condition controls

Removed fixed grid column proportions after longer operators were truncated. Field and operator
selectors now keep their natural text width; the value editor fills the remaining space, and trash
buttons stay at the right. The borderless controls and top/bottom/inter-row dividers are retained.
Verified “is greater than” has equal text client/scroll widths (93px), so the full label is visible.
Formatting, focused lint, and registry generation pass. Evidence: `query-builder-content-sized-controls.png`.

## Query Builder: exterior scope, shared columns, and arkcn calendars

The latest direction keeps separate cards and moves the grouping guide outside them. The guide begins
beside the main All/Any header, spans that card, and branches into child headers. Each deeper group
has its own inset guide. This supersedes the proposed nested-card redesign.

RuleList now uses shared intrinsic field/operator columns, a flexible value column, and an action
column. This aligns rows within a group while preserving full operator labels. Cross-group columns
can differ with their labels. Text/number/date values have subtle field surfaces; selectors retain
chevrons. Both add actions have plus icons, and all trash buttons use identical muted styling that
stays visible on touch. Top/bottom/inter-row dividers are retained.

Date cells now use arkcn DatePicker with single or range selection, day/month/year views, and clearing.
Added missing in-range styles to the shared DatePicker so intermediate days visibly connect the endpoints.
Verified selecting Oct 5–20 stores both ISO endpoints, selecting a single date stores one value, disabled
triggers cannot open, and clearing a range marks that condition incomplete. The human summary uses the
same formatter as the date cell; text/option values are quoted, values are emphasized and do not split
mid-token, and Any groups use “either” rather than repeated “any of”. Tests cover human date summaries,
individual nonwrapping values, invalid/incomplete date inputs, and group descriptions.

Light/dark layouts checked; measured row widths equal scroll widths at 433px/449px. Full checks and docs
build pass. Reference files remain unchanged. Evidence: `query-builder-refined-light.png`,
`query-builder-refined-dark.png`, `query-builder-arkcn-range-picker.png`. Touch calendar interaction,
OS-level reduced motion, and RTL guide rendering remain unverified. Optional between-row logical labels
were not added.

## Rich Text Editor related-pattern audit

Added an isolated reference composed of the pinned shadcn Toggle, Button, Select, and Separator components.
There is no upstream Rich Text Editor counterpart: the reference document surface, prose spacing, toolbar layout,
and footer are disclosed fixture composition, not a shadcn editor implementation. Its controls demonstrate their
own states; they do not edit the reference document. No existing reference component or stylesheet was changed.
The new fixture uses canonical Tailwind class spellings; this does not alter its rendered styling.

Fixed arkcn's toolbar dividers locally with `data-vertical:self-center`. A plain `self-center` lost to the
Separator's `data-vertical:self-stretch` variant in both implementations; this was a cascade issue within each
isolated document, not CSS leaking between frames. All three arkcn dividers now share the buttons' centerline.
The reference divider styling is preserved. Document prose now uses semantic foreground, muted foreground,
border, and code-surface tokens in light and dark mode, with semibold headings.

Interaction checks exposed and fixed editor initialization problems: lazy mounting with controlled HTML could
access a destroyed editor; initial count and toolbar subscriptions could remain at their null-editor snapshot;
and the first external clear could be overwritten by an old-document normalization update. The editor now
initializes after mount, selectors use the current editor before their first transaction, and controlled document
replacement runs before passive effects. Initial content no longer adds an undo entry.

Browser checks cover the initial 15-word/84-character document, empty state, typing, bold selection, applying a
link, disabled read-only controls, and light/dark rendering. A dedicated server-render smoke check is in
`scripts/test-rich-text-editor.mjs`. Typechecking and lint pass. The broader component suite currently stops at
a Query Builder summary expectation changed by concurrent work; Query Builder is intentionally untouched here.
Image insertion, full table editing, touch selection, RTL toolbar navigation, and exhaustive keyboard/IME flows
remain outside this pass. Scheduler is the only styled extension still lacking a comparison fixture.

## Scheduler related-pattern audit

Added a deterministic October 14, 2026 fixture covering day, week, month, all-day content, overlapping events,
compact events, empty state, and editable/read-only modes. The independent reference imports pinned shadcn
Button, Tabs, and Item components. There is no shadcn Scheduler counterpart: calendar grid geometry, event
placement, and headings are explicitly fixture-authored. Reference events are static layout examples, not a
scheduler engine. Existing protected reference files and styles were kept intact; integrity now covers 238 files.

Adjusted only Scheduler production styles: neutral bordered event surfaces, semantically muted current dates,
consistent small date/time typography, and the first time-gutter label. Short event titles no longer flex-shrink
against a second line; events below 40px hide their visual time while keeping the accessible time label. Resize
grips respond to keyboard focus and remain visible without hover. Read-only month events no longer advertise
a grab cursor. Month cells have `min-w-0`, and the last row avoids doubling the outer bottom border.

Browser verification: day/week/month in light and dark themes; the week grid has equal client/scroll widths;
35 month cells have no horizontal overflow and all seven last-row bottom borders are zero; the initial half-hour
event has an unclipped 16px title within 28px and no visible second line. Keyboard pickup and move shifts a
9:00–9:30 event to 9:15–9:45, Shift+Down extends its end to 10:00, and Escape restores 9:00–9:30. Read-only
time-grid events have no tab stop, resize handle, or grab cursor. Next/previous day changes the title and visible
events. Empty state clears month events. Typechecks, lint, docs build (125 routes), and reference integrity pass.

Pointer/touch creation, cross-day drag, resizing across overlap changes, month drag, RTL, DST/time-zone boundaries,
long titles at very narrow widths, and assistive-technology announcements still require deeper interaction checks.
The seven-column audit at narrow widths truncates overlapping event labels; day view exposes their full text.

Initial fixture coverage is now 59 direct counterparts plus 51 related patterns, covering all 110 visible controls.
Six nonvisual helpers are tracked separately. This closes the missing-fixture list, not every interaction/state gap.
Query Builder remains parked by user request. Native porting stays paused for the documented regression pass.

## Scheduler spacing and Resizable handles

Follow-up to the user's review: the resize affordance now matches the production Resizable recipe's 1px
border-colored line and centered 24×4px rounded grip. The grip stays visible, uses an expanded invisible pointer
target, and is no longer clipped by the event container. The upstream reference fixture and styles remain unchanged.

Event titles use 14px/20px text, with two-line wrapping for events at least 80px tall. Compact events below 56px
and narrow event containers below 8rem hide their time text rather than displaying fragments. Quarter-hour slots
retain their real 14px height with an unpadded 12px title. The time gutter is 4rem, with shared 8px label insets;
all-day rows are at least 36px high and vertically centered. Date headings have more padding, the view switcher
aligns to the right, and month dates/events have larger line heights, gaps, and 7rem minimum rows.

Week columns now have a 9rem minimum, scrolling horizontally as a unit in narrow containers. Measured all seven
headings and body columns before/after horizontal scrolling: their x positions and 144px widths match exactly.
The time gutter currently scrolls with that unit; sticky time labels are a possible follow-up. This intentionally
supersedes the previous compressed seven-column fixture. Day view has no horizontal overflow at the audit width.
Pointer dragging the half-hour event's grip down 28px changes its end from 9:30 to 10:00. Keyboard resizing down
to the minimum produces a 14px slot with a 12px title, no vertical padding, and no time line; Escape restores the
original duration. Month spacing was visually checked. Reference integrity, lint, build, and typechecks pass.

## Scheduler sticky gutter and multi-day events

Follow-up: the time grid uses one scroll container. Hour labels, the corner, and the all-day label stay pinned
horizontally; day headings stay pinned vertically. Headers use the background token, and only the current day
receives a muted gray surface. This supersedes the scrolling-gutter limitation in the previous pass. No reference
styles or fixtures changed.

DayColumn now accepts the full event collection, clips timed events to each visible day, and calculates overlap
lanes from those segments. Continuations have square joining edges and retain their original dates; only the
segment containing the actual end has a resize grip. Dragging a continuation moves the whole event, resizing
preserves the end date, and dragging empty time across columns creates a multi-day range. The month example
renders a chip in each intersected date; midnight endpoints are exclusive. All-day strips remain consumer-rendered.

Browser checks: horizontal scroll of 187px left the gutter at x=33px while columns moved; vertical scroll of 36px
left the header at y=121px. Resizing the Oct 14–16 event changed its end from Oct 16 10:00 to 10:30, and dragging
its middle segment right one day shifted the complete range to Oct 15–17 without changing its duration. Cross-day
creation produced a two-day range. Month rendering includes Oct 14, 15, and 16. Light and dark appearances checked.
`node scripts/test-scheduler.mjs` checks day clipping, exclusive midnight ends, overnight events, overlap lanes,
continuation labels, and resize endpoints. Workspace typechecks, lint, docs/registry build, and reference integrity
pass. Full-catalog interaction coverage remains subject to the gaps below.

## Scheduler endpoint resizing, colors, and overlapping week events

Added start/end resize handles with explicit time/date axes. Day uses top/bottom time handles; week exposes
all four edges; month uses left/right date handles. Time resizing snaps to slotMinutes, date resizing preserves
the endpoint's clock time, and endpoints cannot cross. Only actual endpoint segments display their handles.
Handles support keyboard arrows and restore focus when a resized endpoint moves into another day. Read-only
mode removes handles. Week all-day labels, including Release day, are centered.

Week now defaults to overlapping event stacks with aligned edges and deterministic chronological z order.
The initial lane offset was removed after the user found the left gap distracting.
Shorter events sort above longer events with the same start. Focused events come forward; a live move/resize sits
above the resting stack. The columns establish a stacking context so events remain below sticky headers/gutters.
Root eventLayout supports overlap or lanes; day retains lanes by default.

Event and MonthEvent accept neutral, blue, green, amber, red, and violet palettes, using matching light/dark
surfaces, text, borders, hover states, and grips. Neutral remains the default. Updated only Scheduler, its examples,
and documentation; pinned shadcn references remain unchanged.

Verified day start/end pointer resizing and keyboard start resizing; week left-date resizing and top/bottom time
resizing; month end-date pointer resizing and start-date keyboard resizing. Week Design review changed from
10:00–11:30 to 9:30–12:00 through its top/bottom grips. Overlapping Design review and Research shared horizontal
space; their z indices switched from 6/3 to 2/6 when focus moved to Research. Keyboard date resizing retained focus
on the moved endpoint. Read-only mode rendered zero handles. Light/dark palettes and centered all-day text checked.
Scheduler regression tests, workspace typechecks, lint, docs/registry build, and reference integrity pass.

### Scheduler continuous week spans — October 14 follow-up

Replaced the earlier per-day week segments with one event block spanning the visible date columns.
Horizontal resizing measures pointer movement from the grabbed edge, preserves endpoint clock times, and
clamps dates without flipping or duplicating the event. Week clock resizing preserves a minimum one-slot band;
moving a forward clock band keeps it within visible hours. Date handles own corners, avoiding time/date hit-target
collisions. Week stacks place longer events behind shorter ones; focus and active gestures bring events forward.
Day clipping and month chips retain their existing models. Ranges crossing midnight with a reversed clock range
use one full-height week block and explicit date/time labels; this is a deliberate limitation of the rectangular
week representation, not a claim that the event occupies every displayed hour.

Verified in the browser: right-corner extension from one to two and three days, shrinking back, left-corner extension,
shrinking past the opposite endpoint, both vertical edges, minimum clock height, moving from the second day,
clamping a move to visible hours, keyboard expansion beyond Sunday, next-week clipping, and read-only handles.
At 760px wide, horizontal scroll advanced 378px while the time gutter stayed at x=33px. The spanning event remained
one DOM node. Added 114 automated date-range cases plus pointer/keyboard boundary and no-movement regressions.
Screenshot: `scheduler-continuous-week-dark.png`. Reference styles are untouched.

### Scheduler month spans and translucent surfaces — October 14 follow-up

Month events now render one continuous bar per calendar row instead of a chip in every covered cell.
Bars wrap at week boundaries, with handles only at real endpoints. Shared date lanes avoid collisions with
other events; busy week rows grow to contain the lanes. Month pointer targeting reads calendar-cell rectangles,
so grabbing a later day or resizing a far edge no longer jumps back to the owner cell.
Week and month surfaces, including hover palettes, use 60% background opacity while text and grips stay opaque.
Day surfaces retain their previous treatment. Reference styles remain untouched.

Browser checks covered extending a three-day bar to four days, moving from its second day, keyboard extension
across a week boundary with focus on the continuation endpoint, and pointer shrinking back across that boundary.
Computed week/month backgrounds have alpha 0.6 and element opacity 1. Automated coverage adds 94 month date
ranges with Sunday/Monday starts, midnight exclusion, row wrapping, endpoint handles, collision-free lanes,
and pointer regressions for both endpoints, second-day pickup, and cross-row resizing.

### Scheduler compact month layout — October 14 follow-up

Month now adapts to its container width. Below 40rem, event dots replace squeezed chips, weekday headers and date cells are square, with full-date/event-count accessible labels, and selecting it opens day view. Short weekday
labels retain full accessible names. The view selector takes its own toolbar row, avoiding the overlapping
month title. Wide month calendars retain continuous translucent bars and endpoint handles.

Browser checks cover 390px and 320px viewports, including a six-week November: the full month fits with no
horizontal overflow. Selecting October 14 opens day view with all four events. Desktop rendering and light/dark
checks are part of this pass. Screenshot: `scheduler-month-mobile-dark.png`.

## Remaining differences / verification

- Checkbox mixed/indeterminate styling is intentionally different: retain arkcn's primary surface and minus
  indicator. The user preferred this to the pinned shadcn mixed state on 2026-10-13.

- The pinned Checkbox/Radio recipes use native `:disabled` selectors on Base UI elements that render as spans.
  Their isolated disabled examples do not dim; arkcn retains its existing visible disabled styling. This upstream
  recipe/runtime mismatch is recorded rather than removing the disabled affordance.
- The reference Slider puts keyboard focus on a nested range input, so its thumb's `focus-visible` recipe does
  not activate. Ark's thumb keeps its keyboard focus ring.
- Toast gesture dismissal is not supplied by Ark's toast primitive. A separate gesture implementation has not been
  added as part of this styling pass. Mixed-height stack endpoints and reduced-motion fixture behavior are checked;
  operating-system reduced-motion behavior has not been exercised in this follow-up.
- Default example snapshots do not cover every hover, focus, disabled, invalid, selected/mixed, RTL, or vertical state.
  All 110 visible controls now have comparison fixtures. Six helpers have no visible default styles and are tracked
  separately; the fifty-one related-pattern extensions retain the specific gaps listed above.
- Device validation covers iOS. Android has a JavaScript export check, not a runtime visual check.

Keep native porting paused while closing these gaps. Do not describe this audit as exact parity or as completed
solely because the build and component checks pass.
