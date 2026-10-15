import { useState } from "react"
import { Text, View } from "react-native"
import { Table } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useNativeTheme } from "@/lib/theme"

export function TableValidation() {
  const { colors, typography } = useNativeTheme()
  const [selected, setSelected] = useState(false)
  const [narrow, setNarrow] = useState(false)
  const [extra, setExtra] = useState(false)
  const [empty, setEmpty] = useState(false)
  return (
    <View style={{ gap: 16, width: 640, maxWidth: "100%" }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        <Button variant="outline" size="sm" onPress={() => setNarrow(!narrow)}>
          {narrow ? "Wide table" : "Narrow table"}
        </Button>
        <Button variant="outline" size="sm" onPress={() => setExtra(!extra)}>
          {extra ? "Remove long row" : "Add long row"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onPress={() => {
            setEmpty(!empty)
            setSelected(false)
          }}
        >
          {empty ? "Restore rows" : "Empty table"}
        </Button>
      </View>
      <View style={{ width: narrow ? 240 : "100%" }}>
        <Table.Root columnWidths={[40, 180, 140, 120]} accessibilityLabel="Invoice selection">
          <Table.Caption>Selection and totals use the same columns.</Table.Caption>
          <Table.Header>
            <Table.Row>
              <Table.Head checkbox />
              <Table.Head>Invoice</Table.Head>
              <Table.Head>Status</Table.Head>
              <Table.Head align="end">Amount</Table.Head>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {empty ? (
              <Table.Row>
                <Table.Cell colSpan={4} align="center">
                  No invoices.
                </Table.Cell>
              </Table.Row>
            ) : (
              <>
                <Table.Row selected={selected}>
                  <Table.Cell checkbox>
                    <Checkbox.Root
                      accessibilityLabel="Select invoice INV001"
                      checked={selected}
                      onCheckedChange={({ checked }) => setSelected(checked === true)}
                    >
                      <Checkbox.Control>
                        <Checkbox.Indicator />
                      </Checkbox.Control>
                    </Checkbox.Root>
                  </Table.Cell>
                  <Table.Cell textStyle={typography.medium}>INV001</Table.Cell>
                  <Table.Cell>Paid</Table.Cell>
                  <Table.Cell align="end">$250.00</Table.Cell>
                </Table.Row>
                <Table.Row>
                  <Table.Cell />
                  <Table.Cell textStyle={typography.medium}>INV002</Table.Cell>
                  <Table.Cell>Pending</Table.Cell>
                  <Table.Cell align="end">$150.00</Table.Cell>
                </Table.Row>
              </>
            )}
          </Table.Body>
          <Table.Footer>
            <Table.Row>
              <Table.Cell colSpan={3}>Total</Table.Cell>
              <Table.Cell align="end">{empty ? "$0.00" : "$400.00"}</Table.Cell>
            </Table.Row>
          </Table.Footer>
        </Table.Root>
      </View>
      <Text style={{ ...typography.regular, color: colors.mutedForeground, fontSize: 14, lineHeight: 20 }}>
        {selected ? "1 invoice selected" : "No invoices selected"}
      </Text>
      <Table.Root accessibilityLabel="Automatic column sizing">
        <Table.Header>
          <Table.Row>
            <Table.Head>Project</Table.Head>
            <Table.Head>Owner</Table.Head>
            <Table.Head align="end">Tasks</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.Cell>Website</Table.Cell>
            <Table.Cell>Ada</Table.Cell>
            <Table.Cell align="end">12</Table.Cell>
          </Table.Row>
          {extra && (
            <Table.Row>
              <Table.Cell>International storefront redesign</Table.Cell>
              <Table.Cell>Grace Hopper</Table.Cell>
              <Table.Cell align="end">120</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table.Root>
    </View>
  )
}
