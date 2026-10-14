import { useState } from "react"
import { Table } from "../adapters/table"
import { Checkbox } from "../adapters/checkbox"
import { Button } from "../adapters/button"
export default function Example() {
  const [selected, setSelected] = useState(true)
  const [expanded, setExpanded] = useState(true)
  return (
    <section data-audit-case="table">
      <Table.Root>
        <Table.Caption>Recent invoices and payment status.</Table.Caption>
        <Table.Header>
          <Table.Row>
            <Table.Head>
              <Checkbox.Root
                checked={selected}
                onCheckedChange={(d) => setSelected(d.checked === true)}
                aria-label="Select invoice"
              >
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.HiddenInput />
              </Checkbox.Root>
            </Table.Head>
            <Table.Head>Invoice</Table.Head>
            <Table.Head>Status</Table.Head>
            <Table.Head className="text-right">Amount</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row data-state={selected ? "selected" : undefined}>
            <Table.Cell>
              <Checkbox.Root
                checked={selected}
                onCheckedChange={(d) => setSelected(d.checked === true)}
                aria-label="Select first invoice"
              >
                <Checkbox.Control>
                  <Checkbox.Indicator />
                </Checkbox.Control>
                <Checkbox.HiddenInput />
              </Checkbox.Root>
            </Table.Cell>
            <Table.Cell>INV001</Table.Cell>
            <Table.Cell>Paid</Table.Cell>
            <Table.Cell className="text-right">$250.00</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell />
            <Table.Cell>
              <Button variant="ghost" size="sm" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
                INV002
              </Button>
            </Table.Cell>
            <Table.Cell>Pending</Table.Cell>
            <Table.Cell className="text-right">$150.00</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell />
            <Table.Cell>INV003</Table.Cell>
            <Table.Cell>Unpaid</Table.Cell>
            <Table.Cell className="text-right">$350.00</Table.Cell>
          </Table.Row>
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <Table.Cell colSpan={3}>Total</Table.Cell>
            <Table.Cell className="text-right">$750.00</Table.Cell>
          </Table.Row>
        </Table.Footer>
      </Table.Root>
    </section>
  )
}
