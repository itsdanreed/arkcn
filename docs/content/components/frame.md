# Frame

Frame.Root renders an isolated iframe document and portals its children into that document. The head prop adds frame-specific styles or metadata. onMount and onUnmount track the framed content.

Give the iframe an informative title. Its DOM must remain an iframe for isolation and portals to work, so the root does not accept asChild.
