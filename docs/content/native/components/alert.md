## Alert

Compose Root, Title, and Description for inline status messages. The `destructive` variant uses the shared
error color. Title and Description render native Text; Root accepts layout styles.

Place an optional Action directly inside Root; it is positioned in the upper right and reserves room in the
message. Action accepts native controls, such as a small Button. Alerts use the alert accessibility role and
polite live-region behavior where supported. They are inline content rather than operating-system dialogs.

Pass `icon={<Terminal size={16} />}` to Root for the same icon column as the web alert.
