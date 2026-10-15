## How it works

Compose `Steps.Root`, `List`, `Item`, `Trigger`, `Indicator`, `Separator`, and indexed `Content` panels. `CompletedContent` appears when `step` reaches `count`. `PrevTrigger` and `NextTrigger` reuse the native Button's outline/default small variants. The 28px indicators, 14px labels, separators, light/dark colors, and color transitions follow the web component. `Progress` adds an animated 4px track; all transitions honor reduced motion.

Use `step` / `defaultStep` with `onStepChange({ step })`. Steps are zero-based; `count` is the completed state. `onStepComplete()` reports a navigation request reaching that state. Controlled callers own the value. `useSteps`, `RootProvider`, and `Context` expose `setStep`, `goToNextStep`, `goToPrevStep`, `resetStep`, item states, and progress. Counts must be positive integers and step values must be between zero and count.

`linear` prevents clicking step indicators to jump; Back and Next remain available. `isStepValid(index)` blocks moving forward from an invalid step unless `isStepSkippable(index)` returns true. `onStepInvalid` reports the blocked action. Moving backward and resetting remain available. Individual trigger callbacks can prevent the default action.

Panels stay mounted by default to preserve form values while navigating. Set `lazyMount` to delay first mounting and `unmountOnExit` to discard inactive panels. Hidden panels are excluded from accessibility. String children of triggers, indicators, and panels receive matching native typography; use `textStyle` to customize those strings. Custom content uses native Views and Text. There are no DOM props or `asChild`.

Set `orientation="vertical"` for a vertical step list alongside the content. Compose content and navigation inside a View when grouping them beside the list. Provide `accessibilityLabel` for icon-only triggers. The selected step, disabled navigation buttons, and progress value are exposed to assistive technology.
