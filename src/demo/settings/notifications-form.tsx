import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { showSubmittedData } from "@/demo/lib/show-submitted-data"
import { useForm } from "@/lib/form"

type NotificationsFormValues = {
  type: "all" | "mentions" | "none" | ""
  mobile: boolean
  communication_emails: boolean
  social_emails: boolean
  marketing_emails: boolean
  security_emails: boolean
}

const emailSettings = [
  { key: "communication_emails", label: "Communication emails", desc: "Receive emails about your account activity." },
  {
    key: "marketing_emails",
    label: "Marketing emails",
    desc: "Receive emails about new products, features, and more.",
  },
  { key: "social_emails", label: "Social emails", desc: "Receive emails for friend requests, follows, and more." },
  {
    key: "security_emails",
    label: "Security emails",
    desc: "Receive emails about your account activity and security.",
    disabled: true,
  },
] as const

export function NotificationsForm() {
  const { values, errors, setValue, handleSubmit } = useForm<NotificationsFormValues>(
    {
      type: "",
      mobile: false,
      communication_emails: false,
      marketing_emails: false,
      social_emails: true,
      security_emails: true,
    },
    (v) => (v.type ? {} : { type: "Please select a notification type." }),
    (data) => showSubmittedData(data)
  )

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="gap-8">
        <FieldSet data-invalid={!!errors.type || undefined} className="gap-3">
          <FieldLegend variant="label">Notify me about...</FieldLegend>
          <RadioGroup
            value={values.type || null}
            onValueChange={({ value }) => setValue("type", value as NotificationsFormValues["type"])}
            className="flex flex-col gap-2"
          >
            <RadioGroupItem value="all">All new messages</RadioGroupItem>
            <RadioGroupItem value="mentions">Direct messages and mentions</RadioGroupItem>
            <RadioGroupItem value="none">Nothing</RadioGroupItem>
          </RadioGroup>
          <FieldError>{errors.type}</FieldError>
        </FieldSet>

        <div>
          <h3 className="mb-4 text-lg font-medium">Email Notifications</h3>
          <div className="space-y-4">
            {emailSettings.map((setting) => (
              <Field key={setting.key} orientation="horizontal" className="justify-between rounded-lg border p-4">
                <FieldContent>
                  <FieldLabel htmlFor={`notifications-${setting.key}`} className="text-base">
                    {setting.label}
                  </FieldLabel>
                  <FieldDescription>{setting.desc}</FieldDescription>
                </FieldContent>
                <Switch
                  ids={{ hiddenInput: `notifications-${setting.key}` }}
                  checked={values[setting.key]}
                  onCheckedChange={({ checked }) => setValue(setting.key, checked)}
                  disabled={"disabled" in setting && setting.disabled}
                  aria-readonly={"disabled" in setting && setting.disabled ? true : undefined}
                />
              </Field>
            ))}
          </div>
        </div>

        <Field orientation="horizontal">
          <Checkbox
            ids={{ hiddenInput: "notifications-mobile" }}
            checked={values.mobile}
            onCheckedChange={({ checked }) => setValue("mobile", checked === true)}
          />
          <FieldContent>
            <FieldLabel htmlFor="notifications-mobile">Use different settings for my mobile devices</FieldLabel>
            <FieldDescription>
              You can manage your mobile notifications in the{" "}
              <a href="#/settings" className="underline decoration-dashed underline-offset-4 hover:decoration-solid">
                mobile settings
              </a>{" "}
              page.
            </FieldDescription>
          </FieldContent>
        </Field>

        <div>
          <Button type="submit">Update notifications</Button>
        </div>
      </FieldGroup>
    </form>
  )
}
