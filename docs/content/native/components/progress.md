## Progress

Compose Root, Label, ValueText, Track, and Range for a linear bar. Pass a numeric `value` with optional `min`/`max`
(0/100 by default). Values are clamped; bounds must be finite with `max > min`. ValueText displays the normalized
percentage, or your supplied children. Give Root an `accessibilityLabel` describing the task.

For circular progress, compose Circle, CircleTrack, and CircleRange. The default diameter is 40 pixels and stroke
thickness is 3 pixels, matching the web component. Circle accepts `size` and `thickness`. Value changes animate the
stroke offset over 150 ms using the shared easing curve.

Set `value={null}` for indeterminate progress. The linear range occupies one third of the track and pulses every two
seconds, exactly as the web component. An indeterminate circle is a full ring, matching the web circle. Reduced motion
disables the pulse and transitions. An unknown value omits the current accessibility range value.

`Progress.View state="loading"`, `"complete"`, or `"indeterminate"` conditionally renders content. Context exposes
normalized percentage, indeterminate status, and state. The current native Root takes an externally supplied value;
Ark's uncontrolled state hook and RootProvider are not yet implemented.
