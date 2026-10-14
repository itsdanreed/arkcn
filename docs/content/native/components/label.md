## Label

`Label.Root` uses the web label's 14-pixel medium typography and tight line height. `disabled` dims it and prevents
activation. Native labels use `controlRef` to focus a TextInput, or `onPress` to activate another control; they do not
use DOM `htmlFor`. Supply a matching `accessibilityLabel` on the control so its purpose is announced independently.

The label forwards native Text props and merges `style` after its defaults. A prevented press does not focus the input.
