/** Development fixture for keyboard, pointer, validation, and composed-control states. */
import { useState, type ReactNode } from "react"
import { createRoot } from "react-dom/client"
import { View } from "react-native"
import { CheckIcon, MinusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { RadioGroup } from "@/components/ui/radio-group"
import { Toggle } from "@/components/ui/toggle"
import { Tabs } from "@/components/ui/tabs"
import { Button as NativeButton } from "@multicomma/arkcn-react-native/ui/button"
import { Input as NativeInput } from "@multicomma/arkcn-react-native/ui/input"
import { Checkbox as NativeCheckbox } from "@multicomma/arkcn-react-native/ui/checkbox"
import { Switch as NativeSwitch } from "@multicomma/arkcn-react-native/ui/switch"
import { RadioGroup as NativeRadioGroup } from "@multicomma/arkcn-react-native/ui/radio-group"
import { Toggle as NativeToggle } from "@multicomma/arkcn-react-native/ui/toggle"
import { NativeThemeProvider } from "@multicomma/arkcn-react-native/lib/theme"
import WebGroups from "./examples/button-group"
import NativeGroups from "./native-examples/button-group"
import "./index.css"

const variants = ["default", "outline", "secondary", "ghost", "destructive", "link"] as const
function Pair({ name, web, native }: { name: string; web: ReactNode; native: ReactNode }) {
  return (
    <section data-audit={name} className="space-y-3">
      <h2 className="text-sm font-medium">{name}</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <div data-renderer="react" className="flex flex-col gap-4 rounded-lg border p-6">
          {web}
        </div>
        <div data-renderer="react-native" className="flex flex-col gap-4 rounded-lg border p-6">
          {native}
        </div>
      </div>
    </section>
  )
}
function Audit() {
  const [dark, setDark] = useState(false)
  const [reduced, setReduced] = useState(false)
  const [actions, setActions] = useState(0)
  return (
    <div className={dark ? ["dark"].join("") : ""}>
      <NativeThemeProvider colorScheme={dark ? "dark" : "light"} reducedMotion={reduced}>
        <main data-reduced-motion={reduced} className="min-h-screen space-y-8 bg-background p-8 text-foreground">
          <h1 className="text-2xl font-medium">Component state audit</h1>
          <p className="text-sm text-muted-foreground">
            React on the left; React Native on the right. Use Tab, Space, and pointer presses to inspect live states.
          </p>
          <div className="flex gap-6">
            <label>
              <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} /> Dark theme
            </label>
            <label>
              <input type="checkbox" checked={reduced} onChange={(e) => setReduced(e.target.checked)} /> Reduced motion
            </label>
            <output aria-label="Action count">Actions: {actions}</output>
          </div>
          <Pair
            name="Button variants"
            web={variants.map((variant) => (
              <div key={variant} className="flex gap-3">
                <Button variant={variant} onClick={() => setActions((n) => n + 1)}>
                  {variant}
                </Button>
                <Button variant={variant} disabled>
                  Disabled {variant}
                </Button>
              </div>
            ))}
            native={variants.map((variant) => (
              <View key={variant} style={{ flexDirection: "row", gap: 12 }}>
                <NativeButton variant={variant} onPress={() => setActions((n) => n + 1)}>
                  {variant}
                </NativeButton>
                <NativeButton variant={variant} disabled>
                  Disabled {variant}
                </NativeButton>
              </View>
            ))}
          />
          <Pair
            name="Button validation and disclosure"
            web={
              <div className="flex gap-3">
                <Button variant="outline" aria-invalid>
                  Invalid
                </Button>
                <Button variant="outline" aria-expanded>
                  Expanded
                </Button>
                <Button variant="ghost" aria-expanded>
                  Open ghost
                </Button>
              </div>
            }
            native={
              <View style={{ flexDirection: "row", gap: 12 }}>
                <NativeButton variant="outline" invalid>
                  Invalid
                </NativeButton>
                <NativeButton variant="outline" accessibilityState={{ expanded: true }}>
                  Expanded
                </NativeButton>
                <NativeButton variant="ghost" accessibilityState={{ expanded: true }}>
                  Open ghost
                </NativeButton>
              </View>
            }
          />
          <Pair name="Button Group" web={<WebGroups />} native={<NativeGroups />} />
          <section data-audit="Group composition" className="space-y-4">
            <h2 className="text-sm font-medium">Group composition: hidden fields, trailing text, and small buttons</h2>
            <ButtonGroup.Root aria-label="Hidden fields">
              <input type="hidden" name="before" />
              <Button variant="outline">First</Button>
              <input type="hidden" name="between" />
              <Button variant="outline">Last action</Button>
              <ButtonGroup.Text>After</ButtonGroup.Text>
              <input type="hidden" name="after" />
            </ButtonGroup.Root>
            <ButtonGroup.Root aria-label="Small actions">
              <Button size="sm" variant="outline">
                Small first
              </Button>
              <Button size="sm" variant="outline">
                Small middle
              </Button>
              <Button size="sm" variant="outline">
                Small last
              </Button>
            </ButtonGroup.Root>
            <ButtonGroup.Root orientation="vertical" aria-label="Vertical fields">
              <input type="hidden" />
              <Button variant="outline">Top</Button>
              <Button variant="outline">Bottom action</Button>
              <ButtonGroup.Text>After</ButtonGroup.Text>
              <input type="hidden" />
            </ButtonGroup.Root>
          </section>
          <Pair
            name="Input states"
            web={
              <>
                <Input.Root aria-label="Default input" placeholder="Default input" />
                <Input.Root aria-label="Invalid input" placeholder="Invalid input" aria-invalid />
                <Input.Root aria-label="Disabled input" placeholder="Disabled input" disabled />
              </>
            }
            native={
              <>
                <NativeInput.Root accessibilityLabel="Default input" placeholder="Default input" />
                <NativeInput.Root accessibilityLabel="Invalid input" placeholder="Invalid input" invalid />
                <NativeInput.Root accessibilityLabel="Disabled input" placeholder="Disabled input" disabled />
              </>
            }
          />
          <Pair
            name="Checkbox states"
            web={([false, true, "indeterminate"] as const).map((checked, index) => (
              <Checkbox.Root key={index} defaultChecked={checked} invalid={index === 1}>
                <Checkbox.Control>
                  <Checkbox.Indicator>
                    <CheckIcon />
                  </Checkbox.Indicator>
                  <Checkbox.Indicator indeterminate>
                    <MinusIcon />
                  </Checkbox.Indicator>
                </Checkbox.Control>
                <Checkbox.Label>{String(checked)}</Checkbox.Label>
                <Checkbox.HiddenInput />
              </Checkbox.Root>
            ))}
            native={([false, true, "indeterminate"] as const).map((checked, index) => (
              <NativeCheckbox.Root key={index} defaultChecked={checked} invalid={index === 1}>
                <NativeCheckbox.Control>
                  <NativeCheckbox.Indicator />
                </NativeCheckbox.Control>
                <NativeCheckbox.Label>{String(checked)}</NativeCheckbox.Label>
              </NativeCheckbox.Root>
            ))}
          />
          <Pair
            name="Switch states"
            web={[false, true].map((checked, index) => (
              <Switch.Root key={index} defaultChecked={checked} invalid={checked}>
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
                <Switch.Label>{checked ? "Invalid checked" : "Unchecked"}</Switch.Label>
                <Switch.HiddenInput />
              </Switch.Root>
            ))}
            native={[false, true].map((checked, index) => (
              <NativeSwitch.Root key={index} defaultChecked={checked} invalid={checked}>
                <NativeSwitch.Control>
                  <NativeSwitch.Thumb />
                </NativeSwitch.Control>
                <NativeSwitch.Label>{checked ? "Invalid checked" : "Unchecked"}</NativeSwitch.Label>
              </NativeSwitch.Root>
            ))}
          />
          <Pair
            name="Radio states"
            web={
              <RadioGroup.Root defaultValue="selected" invalid>
                <RadioGroup.Item value="selected">Selected invalid</RadioGroup.Item>
                <RadioGroup.Item value="other">Unselected invalid</RadioGroup.Item>
                <RadioGroup.Item value="disabled" disabled>
                  Disabled
                </RadioGroup.Item>
              </RadioGroup.Root>
            }
            native={
              <NativeRadioGroup.Root defaultValue="selected" invalid>
                <NativeRadioGroup.Item value="selected">Selected invalid</NativeRadioGroup.Item>
                <NativeRadioGroup.Item value="other">Unselected invalid</NativeRadioGroup.Item>
                <NativeRadioGroup.Item value="disabled" disabled>
                  Disabled
                </NativeRadioGroup.Item>
              </NativeRadioGroup.Root>
            }
          />
          <Pair
            name="Toggle states"
            web={
              <div className="flex gap-3">
                <Toggle.Root variant="outline" defaultPressed>
                  Selected
                </Toggle.Root>
                <Toggle.Root variant="outline">Unselected</Toggle.Root>
                <Toggle.Root disabled>Disabled</Toggle.Root>
              </div>
            }
            native={
              <View style={{ flexDirection: "row", gap: 12 }}>
                <NativeToggle.Root variant="outline" defaultPressed>
                  Selected
                </NativeToggle.Root>
                <NativeToggle.Root variant="outline">Unselected</NativeToggle.Root>
                <NativeToggle.Root disabled>Disabled</NativeToggle.Root>
              </View>
            }
          />
          <section data-audit="Tabs states" className="space-y-4">
            <h2 className="text-sm font-medium">Tabs: selected, disabled, keyboard focus</h2>
            {(["default", "line"] as const).map((variant) => (
              <Tabs.Root key={variant} defaultValue="first">
                <Tabs.List variant={variant}>
                  <Tabs.Trigger value="first">First</Tabs.Trigger>
                  <Tabs.Trigger value="second">Second</Tabs.Trigger>
                  <Tabs.Trigger value="disabled" disabled>
                    Disabled
                  </Tabs.Trigger>
                </Tabs.List>
                <Tabs.Content value="first">First panel</Tabs.Content>
                <Tabs.Content value="second">Second panel</Tabs.Content>
              </Tabs.Root>
            ))}
          </section>
        </main>
      </NativeThemeProvider>
    </div>
  )
}
const root = createRoot(document.getElementById("root")!)
root.render(<Audit />)
import.meta.hot?.dispose(() => root.unmount())
