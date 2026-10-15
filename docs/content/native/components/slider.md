## How it works

Slider uses the desktop component’s 4px muted track, primary range, and 12px white thumb with a ring-color border. Its focus, hover, and drag ring follows the shared motion settings and respects reduced motion. Colors follow the native theme in light and dark modes.

Compose Root, Label, ValueText, Control, Track, Range, and one Thumb per value. Root also supplies the control automatically when no children are passed. Each Thumb takes an index. RootProvider accepts useSlider(), and Context exposes its state and setThumbValue(index, value, commit).

Use value / onValueChange for controlled arrays or defaultValue for uncontrolled values. onValueChangeEnd fires when a gesture finishes or an accessibility/keyboard adjustment commits. min, max, step, and minStepsBetweenThumbs constrain values. Thumbs cannot cross. Track presses select the nearest thumb; dragging continues outside the control until release. disabled and readOnly block changes, and a disabled Fieldset is inherited.

orientation="vertical" places the minimum at the bottom. dir="rtl" reverses horizontal sliders. origin="center" or "end" changes the single-value range fill. Thumb centers remain inside both ends of the track. Horizontal MarkerGroup / Marker display ticks, and DraggingIndicator inside a Thumb displays its value while dragging.

Each thumb is an adjustable accessibility control. Provide individual accessibilityLabel values for range thumbs and getValueText for units or localization. Browser keyboard support includes arrows, Home/End, and PageUp/PageDown. Native forms use the value callback; there is no HiddenInput. The native implementation uses React Native responders to preserve arkcn’s exact custom track and range styling. It does not use a platform-styled single-value slider.
