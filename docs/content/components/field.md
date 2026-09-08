# Field

Field.Root owns required, disabled, readOnly, and invalid state. Compose Label, Input, Textarea, or Select with HelperText and ErrorText for automatically associated labels and descriptions. RequiredIndicator marks a required field. Item supports individually identified controls within the field.

Use asChild on Input to attach these semantics to a custom input that forwards its props and ref. Set the root id when a stable input id is needed. ErrorText appears when the field is invalid.

Group, Content, Title, and Separator provide optional layout. Use the separate Fieldset namespace to group multiple fields. RootProvider accepts useField's return value.
