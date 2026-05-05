# react-native-printer

A unified React Native printer library for Kaseru apps.

Current goal (phase 1):

- ESC/POS receipt printing
- TSC label printing
- Bluetooth / Wi-Fi / USB transports
- One maintainable printer engine repo
- No app-specific business flow inside the library

## Current scope

This repo is intended to replace fragmented printer integrations in existing apps.

Reference/upstream codebases currently used:

- Bluetooth ESC/POS + TSC:
  - https://github.com/kaseru/react-native-bluetooth-escpos-printer
- Wi-Fi / USB / BLE thermal printer:
  - https://github.com/thiendangit/react-native-thermal-receipt-printer-image-qr
- Real app printing flow used as abstraction reference:
  - aSellerV5 internal app flow

Notes:

- This repo does **not** copy `PrintUtils` from app code.
- App flow is only used as implementation reference.
- Sunmi is currently **out of scope**.

## Architecture direction

- `src/core`: types, facade, interfaces
- `src/bluetooth`: Bluetooth ESC/POS + TSC adapter
- `src/network`: NetPrinter / Wi-Fi adapter
- `src/usb`: USB printer adapter
- `src/legacy`: compatibility wrappers around upstream engines

## Phase 1 priorities

- Bluetooth ESC/POS
- Bluetooth TSC
- Wi-Fi ESC/POS
- USB ESC/POS
- Stable baseline public API:
  - `connect()`
  - `disconnect()`
  - `printText()`
  - `printImageBase64()`
  - `printReceipt()`
  - `printLabel()`
  - `cut()`
  - `openDrawer()`

## Migration strategy

Start by wrapping existing engines under one API.
Then progressively split renderer / capability / transport layers if needed.

## iOS source status

- Active iOS source is under `ios/`.
- Legacy trees `ios-bluetooth/` and `ios-thermal/` are still kept in repo temporarily for compatibility/reference.
- Archived copies also exist under `_archive/`.
- New changes should target `ios/` unless explicitly maintaining legacy paths.

## TODO

- [x] Import baseline Bluetooth code from Kaseru repo
- [x] Import baseline Net/USB/BLE thermal code
- [ ] Standardize TypeScript types
- [ ] Design common facade API
- [ ] Add example app / sample usage
- [ ] Add migration docs from old app integrations
