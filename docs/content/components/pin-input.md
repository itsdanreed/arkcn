# Pin Input

Compose PinInput.Root, Label, Control, one Input per index, and HiddenInput. The inputs share a value array; HiddenInput contributes the joined value to a form.

Typing advances focus. Pasting a code distributes its digits, and Backspace clears a digit or moves to the previous input. Use otp for a one-time code, mask to hide the characters, and onValueComplete to respond to a complete code.

Inputs support asChild, so a custom input can receive the same keyboard and accessibility behavior. RootProvider accepts usePinInput's return value.
