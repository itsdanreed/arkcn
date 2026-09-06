import { createListCollection } from "@ark-ui/react/collection"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectControl, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { showSubmittedData } from "@/demo/lib/show-submitted-data"
import { useForm } from "@/lib/form"

type ProfileFormValues = {
  username: string
  email: string
  bio: string
  urls: string[]
}

const emails = createListCollection({ items: ["m@example.com", "m@google.com", "m@support.com"] })

function validate(v: ProfileFormValues) {
  const errors: Partial<Record<keyof ProfileFormValues, string>> = {}
  if (!v.username) errors.username = "Please enter your username."
  else if (v.username.length < 2) errors.username = "Username must be at least 2 characters."
  else if (v.username.length > 30) errors.username = "Username must not be longer than 30 characters."
  if (!v.email) errors.email = "Please select an email to display."
  if (v.bio.length < 4) errors.bio = "Bio must be at least 4 characters."
  else if (v.bio.length > 160) errors.bio = "Bio must not be longer than 160 characters."
  if (v.urls.some((u) => u && !/^https?:\/\/\S+$/.test(u))) errors.urls = "Please enter a valid URL."
  return errors
}

export function ProfileForm() {
  const { values, errors, setValue, handleSubmit } = useForm<ProfileFormValues>(
    { username: "", email: "", bio: "I own a computer.", urls: ["https://example.com", "https://x.com/alexmorgan"] },
    validate,
    (data) => showSubmittedData(data),
    { mode: "onChange" }
  )

  return (
    <form onSubmit={handleSubmit}>
      <FieldGroup className="gap-8">
        <Field data-invalid={!!errors.username || undefined}>
          <FieldLabel htmlFor="profile-username">Username</FieldLabel>
          <Input
            id="profile-username"
            placeholder="alexmorgan"
            value={values.username}
            aria-invalid={!!errors.username || undefined}
            onChange={(e) => setValue("username", e.currentTarget.value)}
          />
          <FieldDescription>
            This is your public display name. It can be your real name or a pseudonym. You can only change this once
            every 30 days.
          </FieldDescription>
          <FieldError>{errors.username}</FieldError>
        </Field>

        <Field data-invalid={!!errors.email || undefined}>
          <FieldLabel htmlFor="profile-email">Email</FieldLabel>
          <Select
            collection={emails}
            value={values.email ? [values.email] : []}
            onValueChange={({ value }) => setValue("email", value[0] ?? "")}
            invalid={!!errors.email}
            ids={{ trigger: "profile-email" }}
          >
            <SelectControl>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a verified email to display" />
              </SelectTrigger>
            </SelectControl>
            <SelectContent>
              {emails.items.map((email) => (
                <SelectItem key={email} item={email}>
                  {email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldDescription>
            You can manage verified email addresses in your <a href="#/">email settings</a>.
          </FieldDescription>
          <FieldError>{errors.email}</FieldError>
        </Field>

        <Field data-invalid={!!errors.bio || undefined}>
          <FieldLabel htmlFor="profile-bio">Bio</FieldLabel>
          <Textarea
            id="profile-bio"
            placeholder="Tell us a little bit about yourself"
            className="resize-none"
            value={values.bio}
            aria-invalid={!!errors.bio || undefined}
            onChange={(e) => setValue("bio", e.currentTarget.value)}
          />
          <FieldDescription>
            You can <span>@mention</span> other users and organizations to link to them.
          </FieldDescription>
          <FieldError>{errors.bio}</FieldError>
        </Field>

        <div>
          {values.urls.map((url, index) => (
            <Field key={index} data-invalid={!!errors.urls || undefined} className={cn(index !== 0 && "mt-1.5")}>
              <FieldLabel htmlFor={`profile-url-${index}`} className={cn(index !== 0 && "sr-only")}>
                URLs
              </FieldLabel>
              <FieldDescription className={cn(index !== 0 && "sr-only")}>
                Add links to your website, blog, or social media profiles.
              </FieldDescription>
              <Input
                id={`profile-url-${index}`}
                value={url}
                aria-invalid={!!errors.urls || undefined}
                onChange={(e) =>
                  setValue(
                    "urls",
                    values.urls.map((u, i) => (i === index ? e.currentTarget.value : u))
                  )
                }
              />
              {index === values.urls.length - 1 && <FieldError>{errors.urls}</FieldError>}
            </Field>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => setValue("urls", [...values.urls, ""])}
          >
            Add URL
          </Button>
        </div>

        <div>
          <Button type="submit">Update profile</Button>
        </div>
      </FieldGroup>
    </form>
  )
}
