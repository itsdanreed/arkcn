# Frame

Frame.Root renders an isolated iframe document and portals its children into that document. The head prop adds frame-specific styles or metadata. onMount and onUnmount track the framed content.

Give the iframe an informative title. Its DOM must remain an iframe for isolation and portals to work, so the root does not accept asChild.

Frame starts borderless and fades in over 300ms when its React content mounts. Reduced-motion preferences disable the transition. Use className to supply a border, corner radius, or other frame styling.

Parent styles and theme settings do not cross the document boundary. Supply the frame's own stylesheet through head and set its theme explicitly. The default document puts its reset in the base CSS layer so utility classes can apply padding and spacing. A custom srcDoc remains responsible for its own document styles.
