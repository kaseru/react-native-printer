# react-native-printer

Standardized React Native printing library for Kaseru use cases.

Initial phase goals:
- Receipt ESC/POS
- Label TSC
- Bluetooth / Wi-Fi / USB connectivity
- Consolidate printing engines into one repo for easier maintenance
- Bring production native modules into one place

## Current scope

This repository is built to replace fragmented printer-library usage in the current app.

Reference/base sources currently used:
- Bluetooth ESC/POS + TSC:
  - https://github.com/kaseru/react-native-bluetooth-escpos-printer
- Wi-Fi / USB / BLE thermal printer:
  - https://github.com/thiendangit/react-native-thermal-receipt-printer-image-qr

Notes:
- This repo already includes the TSC native modules used by the app.
- iOS network printer files currently use a raw socket patch from the app.

## Architecture direction

- `src/index.ts`: public facade with compatible exports
- `src/legacy/bluetooth`: wrapper for Bluetooth ESC/POS + TSC
- `src/legacy/thermal`: wrapper for Net / USB / BLE receipt printing
- `android/`: Android source consolidated under `com.xgitvn.printer`
- `ios/`: single active iOS source

## Phase 1

Priorities:
- Bluetooth ESC/POS
- Bluetooth TSC
- Wi-Fi ESC/POS
- USB ESC/POS
- TSC TCP/USB native modules
- Stable basic public API:
  - `connect()`
  - `disconnect()`
  - `printText()`
  - `printImageBase64()`
  - `printReceipt()`
  - `printLabel()`
  - `cut()`
  - `openDrawer()`

## Migration strategy

The first step is to wrap existing engines into a unified API.
Then split renderer / capability / transport layers further if needed.



## TODO

- [x] Import Bluetooth base code from the Kaseru repo
- [x] Import Net/USB/BLE base code from the thermal repo
- [x] Import TSC native modules from the app
- [x] Standardize Android namespace to `com.xgitvn.printer`
- [ ] Standardize TypeScript types
- [ ] Design a shared facade API
- [ ] Add an example app / sample usage
- [ ] Add migration docs from the old app
