## How it works

Password Input composes the native Input Group and Label controls with secure TextInput entry. Its visibility button uses the same eye icons, compact dimensions, and focus/invalid surfaces as the audited web component. It follows the shared light/dark theme and reduced-motion settings.

Use Root on its own for a default input and visibility action, or compose Label, Control, Input, VisibilityTrigger, and Indicator. Root supports visible/defaultVisible and onVisibilityChange({ visible }); Input supports value/defaultValue and onChangeText. These states are independent. The input stays mounted when visibility changes and retains its text.

Root disabled, invalid, readOnly, and required flow into the input; disabled Fieldsets are inherited. Disabled and read-only roots prevent visibility changes. Label presses focus the input. Override the action's accessibilityLabel or Root translations.visibilityTrigger for localization. Indicator supports children for the visible state and fallback for the hidden state.

For externally managed composition, use usePasswordInput with RootProvider value, or read state through Context/usePasswordInputContext. Native refs, keyboard events, autofill, and selection props are available on Input. Autofill defaults to current-password/password; use autoComplete="new-password" and textContentType="newPassword" for account creation. Autofill availability depends on the OS and password manager.

This uses native secureTextEntry, not a DOM password field. Web-only password-manager attributes, form submission names, and Ark DOM prop getters do not apply. Verify secure-entry keyboard and autofill behavior on the target devices.
