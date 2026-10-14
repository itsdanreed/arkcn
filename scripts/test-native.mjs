import assert from "node:assert/strict"
import { registerHooks } from "node:module"
import { existsSync, readFileSync } from "node:fs"
import { fileURLToPath, pathToFileURL } from "node:url"
import ts from "typescript"
import React from "react"
import { act, create } from "react-test-renderer"

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier === "react-native-reanimated")
      return { url: new URL("./fixtures/native-motion.mjs", import.meta.url).href, shortCircuit: true }
    if (specifier === "react-native-svg")
      return { url: new URL("./fixtures/native-svg.mjs", import.meta.url).href, shortCircuit: true }
    if (specifier === "react-native")
      return { url: new URL("./fixtures/native-host.mjs", import.meta.url).href, shortCircuit: true }
    if (specifier.startsWith(".") && context.parentURL) {
      const base = fileURLToPath(new URL(specifier, context.parentURL))
      const file = [`${base}.ts`, `${base}.tsx`].find(existsSync)
      if (file) return { url: pathToFileURL(file).href, shortCircuit: true }
    }
    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (/\.tsx?$/.test(url) && !url.includes("node_modules")) {
      const source = ts.transpileModule(readFileSync(fileURLToPath(url), "utf8"), {
        compilerOptions: { module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.ReactJSX, target: ts.ScriptTarget.ES2023 },
      }).outputText
      return { format: "module", source, shortCircuit: true }
    }
    return nextLoad(url, context)
  },
})
globalThis.IS_REACT_ACT_ENVIRONMENT = true
const {
  Button,
  Input,
  Textarea,
  Card,
  Badge,
  Spinner,
  Skeleton,
  Separator,
  NativeThemeProvider,
  Checkbox,
  Switch,
  RadioGroup,
  Tabs,
  Collapsible,
  Progress,
  Alert,
  Avatar,
  Toggle,
  ToggleGroup,
  Accordion,
  InputGroup,
  ButtonGroup,
  Label,
} = await import("@multicomma/arkcn-react-native")
const { emitReducedMotion, Platform } = await import("./fixtures/native-host.mjs")
const { timingCalls } = await import("./fixtures/native-motion.mjs")
const { nativeColors } = await import("@multicomma/arkcn-react-native/lib/theme")
const { applyRowDrop, resizeRowItems } = await import("@multicomma/arkcn-core/row-layout")
const { useHistory } = await import("@multicomma/arkcn-react-shared/history")
const h = React.createElement
const flatten = (style) => Object.assign({}, ...[style].flat(Infinity).filter(Boolean))
let tree
const render = async (node) => {
  await act(() => {
    if (tree) tree.update(node)
    else tree = create(node)
  })
  return tree.root
}
try {
  let presses = 0
  await render(h(Button, { onPress: () => presses++, style: ({ pressed }) => ({ margin: pressed ? 7 : 3 }) }, "Save"))
  const pressable = tree.root.findByType("Pressable")
  assert.equal(pressable.props.accessibilityRole, "button")
  await act(() => pressable.props.onPressIn({}))
  assert.equal(flatten(pressable.props.style).margin, 7)
  assert.equal(flatten(pressable.props.style).transform[0].translateY, 1)
  assert.equal(flatten(pressable.props.style).minHeight, 32)
  assert.equal(pressable.props.hitSlop, 6)
  await act(() => pressable.props.onPress())
  assert.equal(presses, 1)
  await render(h(Button, null, "Pressed ", 1, " times"))
  assert.deepEqual(
    tree.root.findByType("Text").props.children,
    ["Pressed ", 1, " times"],
    "composed text labels stay inside native Text"
  )
  await render(h(Button, null, h("Icon"), "Save"))
  assert.equal(tree.root.findByType("Text").props.children, "Save", "icon labels stay inside native Text")
  await render(h(Button, { loading: true, accessibilityLabel: "Save profile" }, "Save"))
  const busy = tree.root.findByType("Pressable")
  assert.equal(busy.props.disabled, true)
  assert.equal(busy.props.accessibilityState.busy, true)
  assert.equal(busy.props.accessibilityLabel, "Save profile")
  assert.equal(flatten(busy.props.style).opacity, 0.5)
  assert.equal(tree.root.findByType("Text").props.children, "Save", "loading retains the text label")

  await render(h(Button, { variant: "outline", invalid: true }, "Invalid action"))
  const invalidButton = tree.root.findByType("Pressable")
  assert.equal(flatten(invalidButton.props.style).borderColor, nativeColors.light.destructive)
  assert.equal(flatten(invalidButton.props.style).boxShadow[0].spreadDistance, 3)
  await render(h(Button, { variant: "outline", accessibilityState: { expanded: true } }, "Open"))
  const expandedButton = tree.root.findByType("Pressable")
  assert.equal(expandedButton.props["aria-expanded"], true)
  assert.equal(flatten(expandedButton.findByType("View").props.style).backgroundColor, nativeColors.light.muted)

  let focus = 0
  let change
  await render(
    h(Input.Root, {
      value: "original",
      onChangeText: (value) => (change = value),
      onFocus: () => focus++,
      accessibilityLabel: "Name",
      style: { margin: 8 },
    })
  )
  let input = tree.root.findByType("TextInput")
  await act(() => input.props.onFocus({}))
  input = tree.root.findByType("TextInput")
  assert.equal(focus, 1)
  assert.equal(flatten(input.props.style).borderColor, nativeColors.light.ring)
  assert.match(
    flatten(input.props.style).boxShadow,
    /^0px 0px 0px 3px /,
    "native focus rings have a sharp, immediate 3px spread"
  )
  assert.deepEqual(
    flatten(input.props.style).transitionProperty,
    ["borderColor", "backgroundColor"],
    "color-only input transitions do not animate the ring"
  )
  await act(() => input.props.onChangeText("changed"))
  assert.equal(change, "changed")
  assert.equal(input.props.value, "original", "controlled inputs leave state with the caller")
  await render(h(Input.Root, { disabled: true, invalid: true }))
  input = tree.root.findByType("TextInput")
  assert.equal(input.props.editable, false)
  assert.equal(input.props.accessibilityState.disabled, true)
  assert.equal(flatten(input.props.style).borderColor, nativeColors.light.destructive)
  await render(h(Textarea.Root, { style: { minHeight: 200 } }))
  input = tree.root.findByType("TextInput")
  assert.equal(input.props.multiline, true)
  assert.equal(flatten(input.props.style).minHeight, 200)

  Platform.OS = "web"
  await render(h(Input.Root, { key: "web-focus" }))
  input = tree.root.findByType("TextInput")
  await act(() => input.props.onFocus({}))
  assert.match(
    flatten(input.props.style).boxShadow,
    /^0px 0px 0px 3px /,
    "web serialization does not turn ring spread into blur"
  )
  await act(() => input.props.onBlur({}))
  assert.equal(flatten(input.props.style).boxShadow, "none", "web ring updates when focus leaves")
  Platform.OS = "ios"
  await render(h(NativeThemeProvider, { reducedMotion: true }, h(Input.Root)))
  input = tree.root.findByType("TextInput")
  await act(() => input.props.onFocus({}))
  assert.equal(flatten(input.props.style).transitionDuration, 0, "reduced motion disables input color transitions")

  await render(
    h(
      NativeThemeProvider,
      { colorScheme: "dark", colors: { border: "custom-border" } },
      h(Card.Root, null, h(Card.Title, null, "Title"), h(Badge.Root, null, "Badge"), h(Separator.Root))
    )
  )
  assert.equal(flatten(tree.root.findAllByType("View")[0].props.style).backgroundColor, nativeColors.dark.card)
  assert.equal(flatten(tree.root.findAllByType("View").at(-1).props.style).backgroundColor, "custom-border")
  assert.equal(tree.root.findAllByType("Text")[0].props.accessibilityRole, "header")
  await render(h(Spinner.Root, { accessibilityLabel: "Saving" }))
  const spinnerStyle = flatten(tree.root.findByType("View").props.style)
  assert.equal(spinnerStyle.width, 16)
  assert.equal(spinnerStyle.animationDuration, 1000)
  assert.equal(spinnerStyle.animationTimingFunction, "linear")
  assert.equal(tree.root.findByType("Path").props.d, "M21 12a9 9 0 1 1-6.219-8.56")
  assert.equal(tree.root.findByType("View").props.accessibilityState.busy, true)
  await act(() => emitReducedMotion(true))
  assert.equal(
    flatten(tree.root.findByType("View").props.style).animationName,
    "none",
    "live system changes stop the loop"
  )
  await act(() => emitReducedMotion(false))
  assert.notEqual(
    flatten(tree.root.findByType("View").props.style).animationName,
    "none",
    "motion resumes when preference is restored"
  )
  await render(h(NativeThemeProvider, { reducedMotion: true }, h(Spinner.Root)))
  assert.equal(flatten(tree.root.findByType("View").props.style).animationName, "none")
  await render(h(Skeleton.Root))
  assert.equal(tree.root.findByType("View").props.importantForAccessibility, "no-hide-descendants")

  assert.equal(flatten(tree.root.findByType("View").props.style).animationDuration, 2000)
  assert.equal(
    flatten(tree.root.findByType("View").props.style).animationTimingFunction,
    "cubic-bezier(0.4, 0, 0.6, 1)",
    "the loading pulse uses shadcn's symmetric easing, not the control transition curve"
  )
  await render(h(NativeThemeProvider, { reducedMotion: true }, h(Skeleton.Root)))
  assert.equal(flatten(tree.root.findByType("View").props.style).animationName, "none")

  const { palettes, nativeColor, designTokens } = await import("@multicomma/arkcn-core/tokens")
  assert.equal(nativeColor([1, 0, 0]), "rgba(255, 255, 255, 1)")
  assert.equal(nativeColor([0, 0, 0]), "rgba(0, 0, 0, 1)")
  assert.equal(nativeColors.dark.card, nativeColor(palettes.dark.card))
  await render(h(Button, { variant: "destructive", size: "xs" }, "Delete"))
  const destructive = tree.root.findByType("Pressable")
  assert.equal(flatten(destructive.props.style).minHeight, designTokens.controlHeight.xs)
  assert.equal(flatten(tree.root.findByType("Text").props.style).color, nativeColors.light.destructive)
  assert.notEqual(flatten(destructive.props.style).backgroundColor, nativeColors.light.destructive)
  await render(
    h(
      NativeThemeProvider,
      { fonts: { regular: "Geist_400Regular", medium: "Geist_500Medium" } },
      h(Button, null, "Save")
    )
  )
  assert.equal(flatten(tree.root.findByType("Text").props.style).fontFamily, "Geist_500Medium")
  assert.equal(
    flatten(tree.root.findByType("Text").props.style).fontWeight,
    "400",
    "loaded font faces avoid synthetic weights"
  )

  const press = (id) => tree.root.findAllByType("Pressable").find((node) => node.props.testID === id)
  const click = async (id, event = { defaultPrevented: false }) => act(() => press(id).props.onPress(event))
  for (const Control of [Checkbox, Switch]) {
    const changes = []
    const control = (props) =>
      h(
        Control.Root,
        { testID: "selection", onCheckedChange: (details) => changes.push(details.checked), ...props },
        h(Control.Control),
        h(Control.Label, null, "Option")
      )
    await render(control({ defaultChecked: false }))
    await click("selection")
    assert.equal(press("selection").props.accessibilityState.checked, true)
    assert.equal(press("selection").props["aria-checked"], true, "React Native Web exposes checked state too")
    assert.deepEqual(changes, [true])
    await render(control({ checked: false }))
    await click("selection")
    assert.equal(press("selection").props.accessibilityState.checked, false, "controlled selection stays with caller")
    assert.deepEqual(changes, [true, true])
    await render(control({ checked: false, readOnly: true }))
    await click("selection")
    await render(control({ checked: false, disabled: true }))
    await click("selection")
    assert.equal(press("selection").props.accessibilityState.disabled, true)
    assert.deepEqual(changes, [true, true], "read-only and disabled controls never fire changes")
    await render(control({ checked: false }))
    await click("selection", { defaultPrevented: true })
    assert.equal(changes.length, 2, "caller can cancel a press")
  }
  await render(h(Checkbox.Root, { testID: "mixed", defaultChecked: "indeterminate" }, h(Checkbox.Control)))
  assert.equal(press("mixed").props.accessibilityState.checked, "mixed")
  assert.equal(press("mixed").props["aria-checked"], "mixed")
  assert.equal(press("mixed").props.hitSlop, 14)
  await click("mixed")
  assert.equal(press("mixed").props.accessibilityState.checked, true)

  await render(
    h(
      Switch.Root,
      { testID: "motion-switch", defaultChecked: false },
      h(Switch.Control, null, h(Switch.Thumb, { testID: "thumb" }))
    )
  )
  const thumb = () => tree.root.findAllByType("View").find((node) => node.props.testID === "thumb")
  assert.equal(flatten(thumb().props.style).transform[0].translateX, 0)
  await click("motion-switch")
  assert.equal(flatten(thumb().props.style).transform[0].translateX, 14)
  assert.equal(flatten(thumb().props.style).transitionDuration, 150)
  assert.equal(flatten(thumb().props.style).transitionTimingFunction, "cubic-bezier(0.4, 0, 0.2, 1)")
  await act(() => emitReducedMotion(true))
  assert.equal(flatten(thumb().props.style).transitionDuration, 0)
  await click("motion-switch")
  assert.equal(flatten(thumb().props.style).transform[0].translateX, 0, "reduced motion still updates selection")
  await act(() => emitReducedMotion(false))

  const radioChanges = []
  const radios = (props = {}) =>
    h(
      RadioGroup.Root,
      { defaultValue: "a", onValueChange: ({ value }) => radioChanges.push(value), ...props },
      h(RadioGroup.Item, { value: "a", testID: "a" }, "A"),
      h(RadioGroup.Item, { value: "b", testID: "b" }, "B"),
      h(RadioGroup.Item, { value: "c", testID: "c", disabled: true }, "C")
    )
  await render(radios())
  await click("b")
  assert.equal(press("a").props.accessibilityState.checked, false)
  assert.equal(press("b").props.accessibilityState.checked, true)
  await click("b")
  await click("c")
  assert.deepEqual(radioChanges, ["b"], "selecting the same or disabled radio does not emit changes")
  await render(radios({ value: "a" }))
  await click("b")
  assert.equal(press("a").props.accessibilityState.checked, true)
  assert.deepEqual(radioChanges, ["b", "b"])

  let mounts = 0
  function StatefulPanel() {
    React.useEffect(() => {
      mounts++
    }, [])
    return h("Text", null, "Panel")
  }
  const tabSet = (props = {}) =>
    h(
      Tabs.Root,
      { defaultValue: "a", ...props },
      h(
        Tabs.List,
        null,
        h(Tabs.Trigger, { value: "a", testID: "tab-a" }, "A"),
        h(Tabs.Trigger, { value: "b", testID: "tab-b" }, "B"),
        h(Tabs.Trigger, { value: "c", testID: "tab-c", disabled: true }, "C")
      ),
      h(Tabs.Content, { value: "a", testID: "panel-a" }, h(StatefulPanel)),
      h(Tabs.Content, { value: "b", testID: "panel-b" }, h("Text", null, "B panel"))
    )
  await render(tabSet({ unmountOnExit: false }))
  assert.equal(mounts, 1)
  assert.equal(
    tree.root.findAllByType("View").some((node) => node.props.testID === "panel-b"),
    false,
    "inactive tabs mount lazily"
  )
  await click("tab-b")
  const hidden = tree.root.findAllByType("View").find((node) => node.props.testID === "panel-a")
  assert.equal(flatten(hidden.props.style).display, "none")
  assert.equal(hidden.props.importantForAccessibility, "no-hide-descendants")
  assert.equal(press("tab-b").props.accessibilityState.selected, true)
  assert.equal(press("tab-b").props["aria-selected"], true)
  await click("tab-c")
  assert.equal(press("tab-b").props.accessibilityState.selected, true)
  await click("tab-a")
  assert.equal(mounts, 1, "preserved panels keep local state")
  await render(tabSet())
  await click("tab-b")
  assert.equal(
    tree.root.findAllByType("View").some((node) => node.props.testID === "panel-a"),
    false
  )
  await click("tab-a")
  assert.equal(mounts, 2, "default exit unmounts the inactive panel")
  await render(tabSet({ value: "a" }))
  await click("tab-b")
  assert.equal(press("tab-a").props.accessibilityState.selected, true)

  const disclosure = (props = {}) =>
    h(
      Collapsible.Root,
      props,
      h(Collapsible.Trigger, { testID: "disclosure" }, "Details"),
      h(Collapsible.Content, { testID: "details" }, h("Text", null, "Content"))
    )
  await render(disclosure({ unmountOnExit: false }))
  assert.equal(press("disclosure").props.accessibilityState.expanded, false)
  await click("disclosure")
  assert.equal(press("disclosure").props.accessibilityState.expanded, true)
  assert.equal(press("disclosure").props["aria-expanded"], true)
  await click("disclosure")
  assert.equal(
    flatten(tree.root.findAllByType("View").find((node) => node.props.testID === "details").props.style).display,
    "none"
  )
  await render(disclosure({ open: false }))
  await click("disclosure")
  assert.equal(press("disclosure").props.accessibilityState.expanded, false)
  await render(disclosure({ disabled: true }))
  await click("disclosure")
  assert.equal(press("disclosure").props.accessibilityState.disabled, true)

  const progress = (value) =>
    h(
      Progress.Root,
      { value, min: 10, max: 20 },
      h(Progress.ValueText),
      h(Progress.Track, null, h(Progress.Range, { testID: "range" }))
    )
  await render(progress(15))
  assert.deepEqual(tree.root.findAllByType("View")[0].props.accessibilityValue, { min: 10, max: 20, now: 15 })
  assert.equal(tree.root.findByType("Text").props.children, "50%")
  assert.equal(
    flatten(tree.root.findAllByType("View").find((node) => node.props.testID === "range").props.style).width,
    "50%"
  )
  await render(progress(100))
  assert.equal(tree.root.findAllByType("View")[0].props.accessibilityValue.now, 20)
  await render(progress(-10))
  assert.equal(tree.root.findAllByType("View")[0].props.accessibilityValue.now, 10)

  await render(
    h(Alert.Root, { variant: "destructive" }, h(Alert.Title, null, "Failed"), h(Alert.Description, null, "Try again"))
  )
  assert.equal(flatten(tree.root.findAllByType("Text")[0].props.style).color, nativeColors.light.destructive)
  assert.equal(tree.root.findByType("View").props.accessibilityRole, "alert")
  const avatar = (uri) => h(Avatar.Root, null, h(Avatar.Image, { source: { uri } }), h(Avatar.Fallback, null, "AR"))
  await render(avatar("first.png"))
  assert.equal(tree.root.findByType("Text").props.children, "AR")
  const firstLoad = tree.root.findByType("Image").props.onLoad
  await act(() => firstLoad({}))
  assert.equal(tree.root.findAllByType("Text").length, 0)
  await render(avatar("second.png"))
  await act(() => firstLoad({}))
  assert.equal(tree.root.findAllByType("Text").length, 1, "stale image requests cannot hide fallback")
  await render(avatar("first.png"))
  await act(() => firstLoad({}))
  assert.equal(tree.root.findAllByType("Text").length, 1, "returning to an earlier URL still starts a new request")
  await act(() => tree.root.findByType("Image").props.onLoad({}))
  assert.equal(tree.root.findAllByType("Text").length, 0)
  await act(() => tree.root.findByType("Image").props.onError({}))
  assert.equal(tree.root.findAllByType("Text").length, 1, "failed images restore fallback")

  let nextPressed
  await render(
    h(
      Toggle.Root,
      { onPressedChange: (value) => (nextPressed = value) },
      h(Toggle.Indicator, { fallback: h("Text", null, "Off") }, h("Text", null, "On"))
    )
  )
  let toggle = tree.root.findByType("Pressable")
  assert.equal(tree.root.findByType("Text").props.children, "Off")
  await act(() => toggle.props.onPress({ defaultPrevented: true }))
  assert.equal(nextPressed, undefined, "cancelled press does not change the toggle")
  await act(() => toggle.props.onPress({}))
  assert.equal(nextPressed, true, "Toggle callback matches Ark's boolean contract")
  assert.equal(tree.root.findByType("Text").props.children, "On")
  await render(h(Toggle.Root, { pressed: false, onPressedChange: (value) => (nextPressed = value) }, "Bold"))
  await act(() => tree.root.findByType("Pressable").props.onPress({}))
  assert.equal(
    tree.root.findByType("Pressable").props.accessibilityState.selected,
    false,
    "controlled toggles wait for their owner"
  )
  assert.equal(nextPressed, true)
  nextPressed = undefined
  await render(h(Toggle.Root, { disabled: true, onPressedChange: (value) => (nextPressed = value) }, "Bold"))
  await act(() => tree.root.findByType("Pressable").props.onPress({}))
  assert.equal(nextPressed, undefined)

  const group = (props) =>
    h(
      ToggleGroup.Root,
      { key: JSON.stringify(props), ...props },
      ...["a", "b", "c"].map((value) => h(ToggleGroup.Item, { value, key: value, disabled: value === "c" }, value))
    )
  await render(group({ defaultValue: ["a"], spacing: 0, variant: "outline" }))
  let groupButtons = tree.root.findAllByType("Pressable")
  assert.equal(flatten(groupButtons[0].props.style).borderTopLeftRadius, 10)
  assert.equal(flatten(groupButtons[1].props.style).borderLeftWidth, 0)
  assert.equal(flatten(groupButtons[2].props.style).borderTopRightRadius, 10)
  await act(() => groupButtons[1].props.onPress({}))
  assert.deepEqual(
    tree.root
      .findAllByType("Pressable")
      .map((item) => item.props.accessibilityState.checked ?? item.props.accessibilityState.selected),
    [false, true, false]
  )
  await act(() => groupButtons[2].props.onPress({}))
  assert.deepEqual(
    tree.root
      .findAllByType("Pressable")
      .map((item) => item.props.accessibilityState.checked ?? item.props.accessibilityState.selected),
    [false, true, false]
  )
  await render(group({ defaultValue: ["a"], multiple: true, deselectable: false }))
  groupButtons = tree.root.findAllByType("Pressable")
  await act(() => groupButtons[1].props.onPress({}))
  await act(() => groupButtons[0].props.onPress({}))
  assert.deepEqual(
    tree.root
      .findAllByType("Pressable")
      .map((item) => item.props.accessibilityState.checked ?? item.props.accessibilityState.selected),
    [false, true, false],
    "multiple groups can deselect even with deselectable=false, matching Ark"
  )
  await render(group({ defaultValue: ["a"], deselectable: false }))
  await act(() => tree.root.findAllByType("Pressable")[0].props.onPress({}))
  assert.equal(tree.root.findAllByType("Pressable")[0].props.accessibilityState.checked, true)

  const accordion = (props, reduced = false) =>
    h(
      NativeThemeProvider,
      { reducedMotion: reduced },
      h(
        Accordion.Root,
        { key: JSON.stringify(props), ...props },
        ...["a", "b"].map((value) =>
          h(
            Accordion.Item,
            { value, key: value },
            h(Accordion.ItemTrigger, null, value),
            h(Accordion.ItemContent, { testID: `accordion-${value}` }, h("Text", null, `Panel ${value}`))
          )
        )
      )
    )
  await render(accordion({ defaultValue: ["a"], collapsible: true }))
  const panel = () => tree.root.findAllByType("View").find((view) => view.props.testID === "accordion-a")
  const measure = tree.root.findAllByType("View").find((view) => view.props.onLayout)
  await act(() => measure.props.onLayout({ nativeEvent: { layout: { height: 70 } } }))
  assert.equal(flatten(panel().props.style).height, 70)
  assert.ok(
    timingCalls.some(
      (call) =>
        call.value === 70 && call.config.duration === 200 && call.config.easing === "cubic-bezier(0, 0, 0.58, 1)"
    )
  )
  assert.equal(tree.root.findAllByType("Pressable")[0].props.accessibilityState.expanded, true)
  await act(() => tree.root.findAllByType("Pressable")[0].props.onPress({}))
  assert.equal(panel().props.accessibilityElementsHidden, true)
  assert.equal(flatten(panel().props.style).height, 0)
  assert.ok(panel(), "content stays mounted during the close animation")
  await act(async () => new Promise((resolve) => setTimeout(resolve, 220)))
  assert.equal(panel(), undefined, "content unmounts after the exit animation")
  await render(accordion({ defaultValue: ["a"], collapsible: false }, true))
  await act(() => tree.root.findAllByType("Pressable")[0].props.onPress({}))
  assert.equal(tree.root.findAllByType("Pressable")[0].props.accessibilityState.expanded, true)
  await act(() => tree.root.findAllByType("Pressable")[1].props.onPress({}))
  assert.deepEqual(
    tree.root.findAllByType("Pressable").map((item) => item.props.accessibilityState.expanded),
    [false, true]
  )
  assert.equal(panel(), undefined, "reduced motion removes the exit delay")
  await render(accordion({ defaultValue: ["a"], multiple: true, unmountOnExit: false }, true))
  await act(() => tree.root.findAllByType("Pressable")[1].props.onPress({}))
  assert.deepEqual(
    tree.root.findAllByType("Pressable").map((item) => item.props.accessibilityState.expanded),
    [true, true]
  )
  await act(() => tree.root.findAllByType("Pressable")[0].props.onPress({}))
  assert.ok(panel(), "retained panels preserve content when closed")

  await render(
    h(
      Progress.Root,
      { value: null },
      h(Progress.Track, null, h(Progress.Range, { testID: "unknown" })),
      h(Progress.ValueText),
      h(Progress.View, { state: "indeterminate", testID: "loading-state" }),
      h(Progress.View, { state: "complete", testID: "complete-state" })
    )
  )
  const progressRoot = tree.root.findAllByType("View").find((view) => view.props.accessibilityRole === "progressbar")
  assert.equal(progressRoot.props.accessibilityValue.now, undefined)
  assert.equal(progressRoot.props.accessibilityState.busy, true)
  assert.equal(tree.root.findByType("Text").props.children, "loading...")
  assert.ok(tree.root.findAllByType("View").some((view) => view.props.testID === "loading-state"))
  assert.ok(!tree.root.findAllByType("View").some((view) => view.props.testID === "complete-state"))
  const unknown = flatten(tree.root.findAllByType("View").find((view) => view.props.testID === "unknown").props.style)
  assert.equal(unknown.width, "33.333333%")
  assert.equal(unknown.animationDuration, 2000)
  await render(
    h(Progress.Root, { value: 25 }, h(Progress.Circle, null, h(Progress.CircleTrack), h(Progress.CircleRange)))
  )
  const circles = tree.root.findAllByType("Circle")
  assert.equal(circles[0].props.r, 18.5)
  assert.equal(circles[1].props.transform, "rotate(-90 20 20)")
  assert.equal(circles[1].props.animatedProps.strokeDashoffset, 2 * 3.14159 * 18.5 * 0.75)

  await render(
    h(
      Avatar.Group,
      null,
      h(Avatar.Root, { size: "lg" }, h(Avatar.Fallback, null, "AM")),
      h(
        Avatar.Root,
        { size: "sm" },
        h(Avatar.Fallback, null, "DR"),
        h(Avatar.Badge, { testID: "small-badge" }, h("Icon"))
      ),
      h(Avatar.GroupCount, { testID: "group-count" }, "+3")
    )
  )
  const views = tree.root.findAllByType("View")
  assert.equal(flatten(views.find((view) => view.props.testID === "group-count").props.style).width, 24)
  assert.equal(flatten(views.find((view) => view.props.testID === "group-count").props.style).marginLeft, -8)
  assert.equal(flatten(views.find((view) => view.props.testID === "small-badge").props.style).width, 8)
  assert.equal(tree.root.findAllByType("Icon").length, 0, "small avatar badges hide their icon")
  let liftedBadge = tree.root.findAllByType("View").find((view) => view.props.testID === "small-badge")
  assert.equal(flatten(liftedBadge.parent.parent.props.style).zIndex, 10, "group badges render above following avatars")
  const avatarMeasure = tree.root.findAllByType("View").find((view) => view.props.onLayout)
  await act(() => avatarMeasure.props.onLayout({ nativeEvent: { layout: { x: 33, y: 2, width: 24, height: 24 } } }))
  liftedBadge = tree.root.findAllByType("View").find((view) => view.props.testID === "small-badge")
  assert.equal(flatten(liftedBadge.parent.parent.props.style).left, 33, "lifted badges follow actual avatar layout")

  let groupFocus = 0
  const groupInputRef = { current: null }
  const groupExample = (invalid = false, disabled = false, showInput = true) =>
    h(
      InputGroup.Root,
      { testID: "input-group" },
      h(InputGroup.Addon, { testID: "addon" }, "Prefix"),
      showInput && h(InputGroup.Input, { ref: groupInputRef, invalid, disabled, accessibilityLabel: "Grouped input" }),
      h(InputGroup.Addon, { align: "inline-end" }, h(InputGroup.Trigger, { testID: "action" }, "Go"))
    )
  await render(groupExample())
  const groupRoot = () => tree.root.findAllByType("View").find((node) => node.props.testID === "input-group")
  const groupedInput = () => tree.root.findByType("TextInput")
  await act(() => groupedInput().props.ref({ focus: () => groupFocus++ }))
  assert.equal(typeof groupInputRef.current.focus, "function", "group controls forward their native input ref")
  await act(() =>
    tree.root
      .findAllByType("Pressable")
      .find((node) => node.props.testID === "addon")
      .props.onPress({})
  )
  assert.equal(groupFocus, 1, "addon activation focuses the associated input")
  await act(() => groupedInput().props.onFocus({}))
  assert.match(flatten(groupRoot().props.style).boxShadow, /3px/, "focus outline belongs to the whole group")
  assert.equal(flatten(groupedInput().props.style).boxShadow, "none", "inner controls suppress their own focus ring")
  assert.deepEqual(
    groupedInput().props.style[0].transitionProperty,
    ["borderColor", "backgroundColor"],
    "input focus rings appear immediately while colors transition"
  )
  await act(() => groupedInput().props.onBlur({}))
  assert.equal(flatten(groupRoot().props.style).boxShadow, "none")
  await render(groupExample(true, true))
  assert.equal(flatten(groupRoot().props.style).borderColor, nativeColors.light.destructive)
  assert.equal(flatten(groupRoot().props.style).opacity, 0.5)
  assert.equal(flatten(groupedInput().props.style).opacity, 1, "disabled opacity applies once to the shared group")
  assert.equal(groupedInput().props.editable, false)
  await act(() =>
    tree.root
      .findAllByType("Pressable")
      .find((node) => node.props.testID === "addon")
      .props.onPress({})
  )
  assert.equal(groupFocus, 1, "disabled controls cannot be focused by their addon")
  let stopped = 0
  await act(() =>
    tree.root
      .findAllByType("Pressable")
      .find((node) => node.props.testID === "action")
      .props.onPress({ stopPropagation: () => stopped++ })
  )
  assert.equal(stopped, 1, "actions do not bubble into addon input activation")
  await render(groupExample(false, false, false))
  assert.equal(flatten(groupRoot().props.style).opacity, 1, "unmounted controls clear disabled registration")
  assert.equal(flatten(groupRoot().props.style).boxShadow, "none", "unmounted controls clear validation registration")

  let joinedPresses = 0
  await render(
    h(
      ButtonGroup.Root,
      null,
      h(Button, { testID: "first", variant: "outline" }, "First"),
      h(
        Button,
        { testID: "last", onPress: () => joinedPresses++, style: ({ pressed }) => ({ marginTop: pressed ? 2 : 0 }) },
        "Last"
      )
    )
  )
  const lastJoined = tree.root.findAllByType("Pressable").find((node) => node.props.testID === "last")
  assert.equal(flatten(lastJoined.props.style).borderLeftWidth, 0)
  assert.equal(
    flatten(lastJoined.findByType("View").props.style).borderTopLeftRadius,
    0,
    "joined backgrounds follow squared corners"
  )
  await act(() => lastJoined.props.onPressIn({}))
  assert.equal(flatten(lastJoined.props.style).marginTop, 2, "group composition retains press style callbacks")
  await act(() => lastJoined.props.onPress({}))
  assert.equal(joinedPresses, 1)

  let labelFocus = 0
  const labelRef = { current: { focus: () => labelFocus++ } }
  await render(h(Label.Root, { controlRef: labelRef }, "Name"))
  await act(() => tree.root.findByType("Text").props.onPress({}))
  assert.equal(labelFocus, 1)
  await render(h(Label.Root, { controlRef: labelRef, disabled: true }, "Name"))
  await act(() => tree.root.findByType("Text").props.onPress({}))
  assert.equal(labelFocus, 1, "disabled labels cannot activate their controls")
  await render(
    h(
      Label.Root,
      {
        controlRef: labelRef,
        onPress: (event) => {
          event.defaultPrevented = true
        },
      },
      "Name"
    )
  )
  await act(() => tree.root.findByType("Text").props.onPress({}))
  assert.equal(labelFocus, 1, "label consumers can cancel default focus")

  let history
  function HistoryHarness() {
    const state = useHistory(0)
    React.useEffect(() => {
      history = state
    })
    return null
  }
  await render(h(HistoryHarness))
  await act(() => history.set(1))
  await act(() => history.undo())
  assert.equal(history.present, 0)
  await act(() => history.redo())
  assert.equal(history.present, 1)
  const rows = [
    {
      id: "row",
      items: [
        { id: "a", width: 1 },
        { id: "b", width: 1 },
      ],
    },
  ]
  const moved = applyRowDrop(
    rows,
    { source: { type: "node", id: "b" }, target: { type: "node", id: "a", edge: "top" } },
    { create: () => null, rowId: () => "new" }
  )
  assert.deepEqual(
    moved.map((row) => row.items.map((item) => item.id)),
    [["b"], ["a"]]
  )
  const resized = resizeRowItems(rows[0], 0, 0.1)
  assert.deepEqual(
    resized.items.map((item) => item.width),
    [1.2, 0.8]
  )
  assert.deepEqual(
    rows[0].items.map((item) => item.width),
    [1, 1]
  )
  console.log(
    "test-native: 23 native components, controlled state, panel lifecycles, image failures, accessibility, and shared behavior pass"
  )
} finally {
  if (tree) await act(() => tree.unmount())
}
