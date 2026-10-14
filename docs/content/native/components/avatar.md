## Avatar

Root supports `sm` (24), `default` (32), and `lg` (40) sizes. Compose Image and Fallback inside it. Label the
Root with `accessible accessibilityLabel="Alex Rivera"` when the avatar conveys identity.

Image uses React Native's `source`, including local assets and `{ uri }`. Fallback renders during image
loading and after failure; it hides only after the current source loads. Changing the source resets this
state. Image forwards `onLoad` and `onError` to the caller. Fallback children render inside native Text.

The native adapter currently manages image loading inside Root; Ark's external state hook and RootProvider are not yet implemented.

### Badges and groups

Place Badge inside Root for a status dot with a two-pixel background ring. Its size follows the avatar (8/10/12 pixels);
icons are eight pixels and hidden for small avatars, matching the web styles.

Group overlaps its direct children by eight pixels and adds background rings. Add GroupCount for a remaining-person
count or icon. Its size follows the avatars in the group; small takes precedence over large in mixed-size groups,
matching the web selectors. Use accessibility labels to explain the status or count.
