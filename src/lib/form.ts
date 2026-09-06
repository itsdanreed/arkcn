import * as React from "react"

type Errors<T> = Partial<Record<keyof T, string>>

/**
 * A small, dependency-free form hook: values, per-field errors, and a submit
 * handler that validates first. Pair it with the `Field*` parts
 * (`data-invalid` on `Field`, `aria-invalid` on the control, `FieldError` for
 * the message). Validation is a plain function so any schema library can be
 * adapted by returning its messages keyed by field.
 */
export function useForm<T extends object>(
  defaultValues: T,
  validate: (values: T) => Errors<T>,
  onSubmit: (values: T) => void,
  options: { mode?: "onSubmit" | "onChange" } = {}
) {
  const [values, setValues] = React.useState<T>(defaultValues)
  const [errors, setErrors] = React.useState<Errors<T>>({})
  const [submitted, setSubmitted] = React.useState(false)

  const setValue = <K extends keyof T>(key: K, value: T[K]) => {
    setValues((prev) => {
      const next = { ...prev, [key]: value }
      if (options.mode === "onChange" || submitted) setErrors(validate(next))
      return next
    })
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    const nextErrors = validate(values)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) onSubmit(values)
  }

  return { values, errors, setValue, setValues, handleSubmit }
}
