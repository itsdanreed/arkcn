## How it works

`Format.Number`, `Format.Byte`, `Format.Time`, and `Format.RelativeTime` return formatted text. Place them inside a native Text so they inherit its typography and light/dark color. The helpers do not add a wrapper or override text styling. `style` on Number or RelativeTime is the Intl formatting option, not a React Native style.

Each helper accepts `locale`. `Format.LocaleProvider` provides a shared locale; a helper's explicit locale takes precedence. Without either, formatting uses the runtime's default locale. Specify a locale when output must be identical across devices.

Number accepts Intl number options, including currency, percent, and fraction digits. Byte accepts `unitSystem="decimal" | "binary"`, `precision`, `unit="byte" | "bit"`, and `unitDisplay`. Binary changes the calculation base to 1024; unit labels follow the web formatter's Intl labels.

Time accepts a Date or `HH:mm[:ss]` string, `format="24h" | "12h"`, `withSeconds`, and optional `amLabel` / `pmLabel`. It formats the local time; invalid values render nothing. RelativeTime accepts a Date and Intl relative-time options such as `numeric="auto"` and `style="short"`. It computes the distance at render time, like the web component; consumers control any periodic refresh.

Number, Byte, and Time use the same `@zag-js/i18n-utils` formatters as the web renderer. RelativeTime follows the same largest-unit rounding. Format includes feature-detected FormatJS relative-time and plural-rules polyfills with English data for Hermes. Existing supported Intl implementations remain in place. For additional languages on Hermes, load both locale data modules in your app entry before rendering:

```ts
import "@formatjs/intl-pluralrules/locale-data/de.js"
import "@formatjs/intl-relativetimeformat/locale-data/de.js"
```

The registry installs these dependencies. Number and clock formatting use the runtime's Intl support. Relative-time locale data is opt-in to avoid bundling every language.

English short byte units normalize the separator to match the web (`1.45 MB`), including on iOS. Narrow units and other locales retain their own Intl spacing. Other locale details can still vary with the host Intl/ICU version.
