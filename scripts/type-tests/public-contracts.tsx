import * as React from "react"
import { AlertDialog, type AlertDialogHeaderProps } from "@/components/ui/alert-dialog"
import { Button, type ButtonProps } from "@/components/ui/button"
import { DataTable, type DataTableBodyProps } from "@/components/ui/data-table"
import { Select, type SelectRootProps } from "@/components/ui/select"

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false
type Expect<T extends true> = T
export type HeaderAliasesMatch = Expect<Equal<AlertDialogHeaderProps, React.ComponentProps<typeof AlertDialog.Header>>>
export type RowAliasesMatch = Expect<
  Equal<DataTableBodyProps<{ name: string }>, React.ComponentProps<typeof DataTable.Body<{ name: string }>>>
>
export type ItemAliasesMatch = Expect<
  Equal<
    SelectRootProps<{ label: string; value: string; count: number }>,
    React.ComponentProps<typeof Select.Root<{ label: string; value: string; count: number }>>
  >
>

interface ExtendedHeaderProps extends AlertDialogHeaderProps {
  eyebrow?: string
}
export function ExtendedHeader({ eyebrow, children, ...props }: ExtendedHeaderProps) {
  return (
    <AlertDialog.Header {...props}>
      {eyebrow && <p>{eyebrow}</p>}
      {children}
    </AlertDialog.Header>
  )
}
export const polymorphicHeader = (
  <ExtendedHeader asChild ref={React.createRef<HTMLDivElement>()}>
    <div>Heading</div>
  </ExtendedHeader>
)
export const extendedButton = (props: ButtonProps & { trackingId?: string }) => {
  const { trackingId, ...buttonProps } = props
  return <Button {...buttonProps} data-tracking={trackingId} />
}
export const tableBody: DataTableBodyProps<{ name: string }> = {
  children: (row) => row.original.name.toUpperCase(),
}
export const invalidBody: DataTableBodyProps<{ name: string }> = {
  // @ts-expect-error The public alias must preserve the row type.
  children: (row) => row.original.missing,
}
export const invalidHeader: AlertDialogHeaderProps = {
  // @ts-expect-error DOM prop validation must remain intact.
  href: "/unexpected",
}

// @ts-expect-error Individual implementations must not be available as imports.
import { AlertDialogHeader } from "@/components/ui/alert-dialog"
export const privateHeaderMustNotImport = AlertDialogHeader
