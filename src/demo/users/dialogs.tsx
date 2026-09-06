import * as React from "react"
import { AlertTriangleIcon, MailPlusIcon, SendIcon } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { type DataTableInstance } from "@/components/ui/data-table"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  PasswordInput,
  PasswordInputControl,
  PasswordInputInput,
  PasswordInputVisibilityTrigger,
} from "@/components/ui/password-input"
import {
  Select,
  SelectContent,
  SelectControl,
  SelectItem,
  SelectTrigger,
  SelectValue,
  createListCollection,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { showSubmittedData } from "@/demo/lib/show-submitted-data"
import { useForm } from "@/lib/form"
import { ConfirmDialog } from "@/demo/tasks/dialogs"
import { roles, type User } from "./data"
import { useUsers } from "./users-provider"

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

const roleCollection = createListCollection({
  items: roles.map(({ label, value }) => ({ label, value })),
  itemToString: (r) => r.label,
  itemToValue: (r) => r.value,
})

function RoleSelect({
  value,
  onValueChange,
  invalid,
  className,
  id,
}: {
  value: string
  onValueChange: (value: string) => void
  invalid?: boolean
  className?: string
  id?: string
}) {
  return (
    <Select
      collection={roleCollection}
      value={value ? [value] : []}
      onValueChange={({ value }) => onValueChange(value[0] ?? "")}
      invalid={invalid}
      ids={id ? { trigger: id } : undefined}
    >
      <SelectControl>
        <SelectTrigger className={cn("w-full", className)}>
          <SelectValue placeholder="Select a role" />
        </SelectTrigger>
      </SelectControl>
      <SelectContent>
        {roleCollection.items.map((role) => (
          <SelectItem key={role.value} item={role}>
            {role.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

/* ------------------------------ Add / edit user ------------------------------ */

type UserFormValues = {
  firstName: string
  lastName: string
  username: string
  email: string
  phoneNumber: string
  role: string
  password: string
  confirmPassword: string
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateUser(isEdit: boolean) {
  return (v: UserFormValues) => {
    const errors: Partial<Record<keyof UserFormValues, string>> = {}
    if (!v.firstName) errors.firstName = "First Name is required."
    if (!v.lastName) errors.lastName = "Last Name is required."
    if (!v.username) errors.username = "Username is required."
    if (!v.email) errors.email = "Email is required."
    else if (!emailRe.test(v.email)) errors.email = "Invalid email address."
    if (!v.phoneNumber) errors.phoneNumber = "Phone number is required."
    if (!v.role) errors.role = "Role is required."
    const password = v.password.trim()
    const skipPassword = isEdit && !password
    if (!skipPassword) {
      if (!password) errors.password = "Password is required."
      else if (password.length < 8) errors.password = "Password must be at least 8 characters long."
      else if (!/[a-z]/.test(password)) errors.password = "Password must contain at least one lowercase letter."
      else if (!/\d/.test(password)) errors.password = "Password must contain at least one number."
      if (password !== v.confirmPassword.trim()) errors.confirmPassword = "Passwords don't match."
    }
    return errors
  }
}

function UserFormRow({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <Field data-invalid={!!error || undefined} className="grid grid-cols-6 items-center gap-x-4 gap-y-1 *:w-auto">
      <FieldLabel htmlFor={htmlFor} className="col-span-2 justify-end text-end">
        {label}
      </FieldLabel>
      <div className="col-span-4">{children}</div>
      <FieldError className="col-span-4 col-start-3">{error}</FieldError>
    </Field>
  )
}

export function UsersActionDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow?: User
}) {
  const isEdit = !!currentRow
  const { values, errors, setValue, handleSubmit } = useForm<UserFormValues>(
    {
      firstName: currentRow?.firstName ?? "",
      lastName: currentRow?.lastName ?? "",
      username: currentRow?.username ?? "",
      email: currentRow?.email ?? "",
      phoneNumber: currentRow?.phoneNumber ?? "",
      role: currentRow?.role ?? "",
      password: "",
      confirmPassword: "",
    },
    validateUser(isEdit),
    (data) => {
      showSubmittedData({ ...data, isEdit })
      onOpenChange(false)
    }
  )
  const passwordTouched = values.password.length > 0

  return (
    <Dialog open={open} onOpenChange={({ open }) => onOpenChange(open)}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="text-start">
          <DialogTitle>{isEdit ? "Edit User" : "Add New User"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the user here. " : "Create new user here. "}Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="h-105 w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3">
          <form id="user-form" onSubmit={handleSubmit} className="px-0.5">
            <FieldGroup className="gap-4">
              <UserFormRow label="First Name" htmlFor="user-first-name" error={errors.firstName}>
                <Input
                  id="user-first-name"
                  placeholder="John"
                  autoComplete="off"
                  value={values.firstName}
                  aria-invalid={!!errors.firstName || undefined}
                  onChange={(e) => setValue("firstName", e.currentTarget.value)}
                />
              </UserFormRow>
              <UserFormRow label="Last Name" htmlFor="user-last-name" error={errors.lastName}>
                <Input
                  id="user-last-name"
                  placeholder="Doe"
                  autoComplete="off"
                  value={values.lastName}
                  aria-invalid={!!errors.lastName || undefined}
                  onChange={(e) => setValue("lastName", e.currentTarget.value)}
                />
              </UserFormRow>
              <UserFormRow label="Username" htmlFor="user-username" error={errors.username}>
                <Input
                  id="user-username"
                  placeholder="john_doe"
                  value={values.username}
                  aria-invalid={!!errors.username || undefined}
                  onChange={(e) => setValue("username", e.currentTarget.value)}
                />
              </UserFormRow>
              <UserFormRow label="Email" htmlFor="user-email" error={errors.email}>
                <Input
                  id="user-email"
                  placeholder="john.doe@gmail.com"
                  value={values.email}
                  aria-invalid={!!errors.email || undefined}
                  onChange={(e) => setValue("email", e.currentTarget.value)}
                />
              </UserFormRow>
              <UserFormRow label="Phone Number" htmlFor="user-phone" error={errors.phoneNumber}>
                <Input
                  id="user-phone"
                  placeholder="+123456789"
                  value={values.phoneNumber}
                  aria-invalid={!!errors.phoneNumber || undefined}
                  onChange={(e) => setValue("phoneNumber", e.currentTarget.value)}
                />
              </UserFormRow>
              <UserFormRow label="Role" htmlFor="user-role" error={errors.role}>
                <RoleSelect
                  id="user-role"
                  value={values.role}
                  onValueChange={(role) => setValue("role", role)}
                  invalid={!!errors.role}
                />
              </UserFormRow>
              <UserFormRow label="Password" htmlFor="user-password" error={errors.password}>
                <PasswordInput ids={{ input: "user-password" }} invalid={!!errors.password}>
                  <PasswordInputControl>
                    <PasswordInputInput
                      placeholder="e.g., S3cur3P@ssw0rd"
                      value={values.password}
                      onChange={(e) => setValue("password", e.currentTarget.value)}
                    />
                    <PasswordInputVisibilityTrigger />
                  </PasswordInputControl>
                </PasswordInput>
              </UserFormRow>
              <UserFormRow label="Confirm Password" htmlFor="user-confirm-password" error={errors.confirmPassword}>
                <PasswordInput
                  ids={{ input: "user-confirm-password" }}
                  invalid={!!errors.confirmPassword}
                  disabled={!passwordTouched}
                >
                  <PasswordInputControl>
                    <PasswordInputInput
                      placeholder="e.g., S3cur3P@ssw0rd"
                      value={values.confirmPassword}
                      onChange={(e) => setValue("confirmPassword", e.currentTarget.value)}
                    />
                    <PasswordInputVisibilityTrigger />
                  </PasswordInputControl>
                </PasswordInput>
              </UserFormRow>
            </FieldGroup>
          </form>
        </div>
        <DialogFooter>
          <Button type="submit" form="user-form">
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* --------------------------------- Invite ---------------------------------- */

type InviteFormValues = { email: string; role: string; desc: string }

export function UsersInviteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { values, errors, setValue, handleSubmit } = useForm<InviteFormValues>(
    { email: "", role: "", desc: "" },
    (v) => {
      const errors: Partial<Record<keyof InviteFormValues, string>> = {}
      if (!v.email) errors.email = "Please enter an email to invite."
      else if (!emailRe.test(v.email)) errors.email = "Invalid email address."
      if (!v.role) errors.role = "Role is required."
      return errors
    },
    (data) => {
      showSubmittedData(data)
      onOpenChange(false)
    }
  )

  return (
    <Dialog open={open} onOpenChange={({ open }) => onOpenChange(open)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-start">
          <DialogTitle className="flex items-center gap-2">
            <MailPlusIcon /> Invite User
          </DialogTitle>
          <DialogDescription>
            Invite new user to join your team by sending them an email invitation. Assign a role to define their access
            level.
          </DialogDescription>
        </DialogHeader>
        <form id="user-invite-form" onSubmit={handleSubmit}>
          <FieldGroup className="gap-4">
            <Field data-invalid={!!errors.email || undefined}>
              <FieldLabel htmlFor="invite-email">Email</FieldLabel>
              <Input
                id="invite-email"
                type="email"
                placeholder="eg: john.doe@gmail.com"
                value={values.email}
                aria-invalid={!!errors.email || undefined}
                onChange={(e) => setValue("email", e.currentTarget.value)}
              />
              <FieldError>{errors.email}</FieldError>
            </Field>
            <Field data-invalid={!!errors.role || undefined}>
              <FieldLabel htmlFor="invite-role">Role</FieldLabel>
              <RoleSelect
                id="invite-role"
                value={values.role}
                onValueChange={(role) => setValue("role", role)}
                invalid={!!errors.role}
              />
              <FieldError>{errors.role}</FieldError>
            </Field>
            <Field>
              <FieldLabel htmlFor="invite-desc">Description (optional)</FieldLabel>
              <Textarea
                id="invite-desc"
                className="resize-none"
                placeholder="Add a personal note to your invitation (optional)"
                value={values.desc}
                onChange={(e) => setValue("desc", e.currentTarget.value)}
              />
            </Field>
          </FieldGroup>
        </form>
        <DialogFooter className="gap-y-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="user-invite-form">
            Invite <SendIcon />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

/* --------------------------------- Delete ---------------------------------- */

export function UsersDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentRow: User
}) {
  const [value, setValue] = React.useState("")
  const confirmed = value.trim() === currentRow.username

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form="users-delete-form"
      disabled={!confirmed}
      destructive
      confirmText="Delete"
      title={
        <span className="inline-flex items-center gap-1 text-destructive">
          <AlertTriangleIcon className="size-4" /> Delete User
        </span>
      }
      description={
        <form
          id="users-delete-form"
          onSubmit={(e) => {
            e.preventDefault()
            if (!confirmed) return
            onOpenChange(false)
            showSubmittedData(currentRow, "The following user has been deleted:")
          }}
          className="space-y-4"
        >
          <p>
            Are you sure you want to delete <span className="font-bold">{currentRow.username}</span>?
            <br />
            This action will permanently remove the user with the role of{" "}
            <span className="font-bold">{currentRow.role.toUpperCase()}</span> from the system. This cannot be undone.
          </p>
          <Label className="flex flex-col items-start gap-1.5">
            <span>Username:</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Enter username to confirm deletion."
              autoFocus
            />
          </Label>
          <Alert variant="destructive">
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>Please be careful, this operation can not be rolled back.</AlertDescription>
          </Alert>
        </form>
      }
    />
  )
}

/* ------------------------------ Multi delete -------------------------------- */

const CONFIRM_WORD = "DELETE"

export function UsersMultiDeleteDialog({
  open,
  onOpenChange,
  table,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  table: DataTableInstance<User>
}) {
  const [value, setValue] = React.useState("")
  const count = table.getFilteredSelectedRowModel().rows.length
  const noun = count > 1 ? "users" : "user"

  const handleDelete = () => {
    if (value.trim() !== CONFIRM_WORD) {
      toast.error(`Please type "${CONFIRM_WORD}" to confirm.`)
      return
    }
    onOpenChange(false)
    toast.promise(sleep(2000), {
      loading: "Deleting users...",
      success: () => {
        setValue("")
        table.resetRowSelection()
        return `Deleted ${count} ${noun}`
      },
      error: "Error",
    })
  }

  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      form="users-multi-delete-form"
      disabled={value.trim() !== CONFIRM_WORD}
      destructive
      confirmText="Delete"
      title={
        <span className="inline-flex items-center gap-1 text-destructive">
          <AlertTriangleIcon className="size-4" /> Delete {count} {noun}
        </span>
      }
      description={
        <form
          id="users-multi-delete-form"
          onSubmit={(e) => {
            e.preventDefault()
            handleDelete()
          }}
          className="space-y-4"
        >
          <p>
            Are you sure you want to delete the selected users?
            <br />
            This action cannot be undone.
          </p>
          <Label className="flex flex-col items-start gap-1.5">
            <span>Confirm by typing "{CONFIRM_WORD}":</span>
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={`Type "${CONFIRM_WORD}" to confirm.`}
              autoFocus
            />
          </Label>
          <Alert variant="destructive">
            <AlertTitle>Warning!</AlertTitle>
            <AlertDescription>Please be careful, this operation can not be rolled back.</AlertDescription>
          </Alert>
        </form>
      }
    />
  )
}

/* ------------------------------ Dialog switch -------------------------------- */

export function UsersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useUsers()
  const close = () => {
    setOpen(null)
    setTimeout(() => setCurrentRow(null), 500)
  }
  return (
    <>
      <UsersActionDialog
        key="user-add"
        open={open === "add"}
        onOpenChange={(o) => (o ? setOpen("add") : setOpen(null))}
      />
      <UsersInviteDialog
        key="user-invite"
        open={open === "invite"}
        onOpenChange={(o) => (o ? setOpen("invite") : setOpen(null))}
      />
      {currentRow && (
        <>
          <UsersActionDialog
            key={`user-edit-${currentRow.id}`}
            open={open === "edit"}
            onOpenChange={(o) => (o ? setOpen("edit") : close())}
            currentRow={currentRow}
          />
          <UsersDeleteDialog
            key={`user-delete-${currentRow.id}`}
            open={open === "delete"}
            onOpenChange={(o) => (o ? setOpen("delete") : close())}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  )
}
