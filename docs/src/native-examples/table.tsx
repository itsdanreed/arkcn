import { Table } from "@multicomma/arkcn-react-native/ui/table"
import { useNativeTheme } from "@multicomma/arkcn-react-native/lib/theme"

const invoices = [
  { id: "INV001", status: "Paid", method: "Credit card", amount: "$250.00" },
  { id: "INV002", status: "Pending", method: "PayPal", amount: "$150.00" },
  { id: "INV003", status: "Unpaid", method: "Bank transfer", amount: "$350.00" },
]

export default function TableExample() {
  const { typography } = useNativeTheme()
  return (
    <Table.Root>
      <Table.Caption>A list of your recent invoices.</Table.Caption>
      <Table.Header>
        <Table.Row>
          <Table.Head>Invoice</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head>Method</Table.Head>
          <Table.Head align="end">Amount</Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {invoices.map((inv) => (
          <Table.Row key={inv.id}>
            <Table.Cell textStyle={typography.medium}>{inv.id}</Table.Cell>
            <Table.Cell>{inv.status}</Table.Cell>
            <Table.Cell>{inv.method}</Table.Cell>
            <Table.Cell align="end">{inv.amount}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  )
}
