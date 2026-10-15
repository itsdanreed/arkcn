import { useState } from "react"
import { Text, View } from "react-native"
import { Breadcrumb } from "@/components/ui/breadcrumb"
import { useNativeTheme } from "@/lib/theme"

export function BreadcrumbValidation() {
  const { colors, typography } = useNativeTheme()
  const [selection, setSelection] = useState("None")
  const label = { ...typography.regular, color: colors.mutedForeground, fontSize: 14, lineHeight: 20 }
  return (
    <View style={{ gap: 16 }}>
      <Text style={label}>Right to left</Text>
      <Breadcrumb.Root dir="rtl">
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link onPress={() => setSelection("RTL Home")}>Home</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.Page>Components</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
      <Text style={label}>Narrow path · long labels</Text>
      <Breadcrumb.Root style={{ width: 180 }}>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link onPress={() => setSelection("Workspace")}>Workspace</Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.Link onPress={() => setSelection("Documentation and examples")}>
              Documentation and examples
            </Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item>
            <Breadcrumb.Page>Accessible navigation</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
      <Text style={label}>Omitted ancestors and disabled links</Text>
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item>
            <Breadcrumb.Link accessibilityLabel="More ancestors" onPress={() => setSelection("More ancestors")}>
              <Breadcrumb.Ellipsis />
            </Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator>/</Breadcrumb.Separator>
          <Breadcrumb.Item>
            <Breadcrumb.Link disabled onPress={() => setSelection("Disabled link activated")}>
              Archived
            </Breadcrumb.Link>
          </Breadcrumb.Item>
          <Breadcrumb.Separator>/</Breadcrumb.Separator>
          <Breadcrumb.Item>
            <Breadcrumb.Page>Current</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
      <Text accessibilityLiveRegion="polite" style={label}>
        Selected: {selection}
      </Text>
    </View>
  )
}
