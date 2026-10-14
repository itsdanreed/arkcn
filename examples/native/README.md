# Native validation app

An Expo SDK 57 consumer of the arkcn React Native registry. It runs the same 23 examples as the docs, with Geist regular/medium fonts, light/dark themes, and a reduced-motion toggle.

This app has its own dependency lockfile because Expo pins React Native, Reanimated, and Worklets to compatible versions. It intentionally sits outside the library workspaces so the latest library development dependencies cannot replace Expo's runtime.

From the repository root:

```sh
npm ci
npm run build:registry
cd examples/native
npm ci
npm run sync
npm run typecheck
npm run ios:release
```

For Android, install the Android SDK and start an emulator, then run `npm run android:release`. `npm start` supports Expo Go during development. Use a release build on a physical device to assess animation performance.

`npm run sync` installs the current local registry through the CLI and copies the docs examples with local imports. Generated components, helpers, and demos are ignored; edit their sources in `packages/react-native` and `docs/src/native-examples`, rebuild the registry, then sync again. After adding a new native dependency, use `npx expo install` for SDK-compatible versions and update this app's lockfile.

Check each example in both themes and with motion enabled/reduced. Exercise checkbox, radio, switch, tabs, and disclosure states; focus/type in inputs; check spinner, skeleton, and progress animations. Browser preview checks alone do not establish native rendering parity.

For a matching web reference, run the docs dev server and open `/arkcn/parity.html` at the phone's logical width (402 px for iPhone 17). Below 640 px, the React example appears above the React Native Web example. The preview uses the same horizontal padding as this app, so line wrapping and component dimensions can be compared at the same available width.
