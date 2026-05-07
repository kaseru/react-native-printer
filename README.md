# react-native-printer

React Native printer library for ESC/POS and TSC on Bluetooth, Wi-Fi and USB.

Based on:
- https://github.com/kaseru/react-native-bluetooth-escpos-printer
- https://github.com/thiendangit/react-native-thermal-receipt-printer-image-qr

## Usage guide

### Install

```bash
yarn add react-native-printer
```

For iOS, install pods after adding the package:

```bash
cd ios && pod install
```

### Import

```ts
import {
  EscNetPrinter,
  EscUsbPrinter,
  EscBluetoothPrinter,
  TscNetPrinter,
  TscUsbPrinter,
  TscBluetoothPrinter,
  COMMANDS,
  ping,
} from "react-native-printer";
```

### ESC/POS over Wi-Fi (receipt)

```ts
async function printReceipt() {
  await EscNetPrinter.init();
  await EscNetPrinter.connect("192.168.1.120", 9100, 2000);

  EscNetPrinter.printText("Store demo\n");
  EscNetPrinter.printColumnsText(
    ["Coffee", "2", "50,000"],
    [16, 6, 10],
    [0, 2, 2],
    []
  );
  EscNetPrinter.printBill("Thank you!\n", { cut: true, beep: true });

  await EscNetPrinter.disconnect();
}
```

### ESC/POS over USB (Android only)

```ts
async function printViaUsb() {
  await EscUsbPrinter.init();
  const devices = await EscUsbPrinter.getDeviceList();
  if (!devices.length) throw new Error("No USB printer found");

  const first = devices[0];
  await EscUsbPrinter.connect(first.vendor_id, first.product_id);
  EscUsbPrinter.printText("USB print test\n");
  EscUsbPrinter.printBill("Done\n", { cut: true });
  await EscUsbPrinter.disconnect();
}
```

### Open cash drawer (ESC/POS)

```ts
EscNetPrinter.openDrawer();
// or raw command directly
EscNetPrinter.printText(COMMANDS.CASH_DRAWER.CD_KICK_2);
```

### TSC label printing

TSC APIs are provided by native modules (`TscNetPrinter`, `TscUsbPrinter`, `TscBluetoothPrinter`).
Available commands depend on platform native implementations in this repo.

```ts
// Example: check network reachability before using TscNetPrinter
const ok = await ping("192.168.1.130", 1000);
if (ok) {
  // Call TscNetPrinter native methods here
}
```

### Platform notes

- ESC USB is Android-only. iOS will throw `...is not supported on iOS` for ESC USB calls.
- ESC Net is available on both Android and iOS.
- TSC USB fallback on iOS is not supported.
- Some iOS ESC printing paths preprocess inline style tags such as `<B>`, `<C>`, `<M>`.

### Exported API (current)

- `EscNetPrinter`
- `EscUsbPrinter`
- `EscBluetoothPrinter`
- `BluetoothPrinter`
- `TscNetPrinter`
- `TscUsbPrinter`
- `TscBluetoothPrinter`
- `COMMANDS`
- `ping(host, timeoutMs?)`

## Native bridge mapping (JS -> Android/iOS)

This table lists methods exported by native modules and exposed to JS.

| JS module | JS method | Android native | iOS native | Notes |
|---|---|---|---|---|
| `EscNetPrinter` | `init` | `EscPrinterNetwork.init` | `EscNetPrinter.init` | Supported on both platforms |
| `EscNetPrinter` | `getDeviceList` | `EscPrinterNetwork.getDeviceList` | `EscNetPrinter.getDeviceList` | Supported on both platforms |
| `EscNetPrinter` | `connect` | `EscPrinterNetwork.connect` | `EscNetPrinter.connect` | Supported on both platforms |
| `EscNetPrinter` | `disconnect` | `EscPrinterNetwork.disconnect` | `EscNetPrinter.disconnect` | Supported on both platforms |
| `EscNetPrinter` | `printText` | `EscPrinterNetwork.printRawData` via JS wrapper | `EscNetPrinter.printRawData` via JS wrapper | Supported on both platforms |
| `EscNetPrinter` | `printBill` | `EscPrinterNetwork.printRawData` via JS wrapper | `EscNetPrinter.printRawData` via JS wrapper | Supported on both platforms |
| `EscNetPrinter` | `printImage` | `EscPrinterNetwork.printImageData` | `EscNetPrinter.printImageData` | Supported on both platforms |
| `EscNetPrinter` | `printImageBase64` | `EscPrinterNetwork.printImageBase64` | `EscNetPrinter.printImageBase64` | Supported on both platforms |
| `EscNetPrinter` | `printColumnsText` | `EscPrinterNetwork.printRawData` via JS wrapper | `EscNetPrinter.printRawData` via JS wrapper | Supported on both platforms |
| `EscNetPrinter` | `openDrawer` | `EscPrinterNetwork.printRawData` via JS wrapper | `EscNetPrinter.printRawData` via JS wrapper | iOS sends text path; Android can send raw pulse bytes |
| `EscNetPrinter` | `printRaw` (native direct) | Not exported | `EscNetPrinter.printRaw` | iOS-only native helper |
| `EscNetPrinter` | `sendHex` (native direct) | Not exported | `EscNetPrinter.sendHex` | iOS-only native helper |
| `EscUsbPrinter` | `init` | `EscUSBPrinter.init` | Not available | Android only |
| `EscUsbPrinter` | `getDeviceList` | `EscUSBPrinter.getDeviceList` | Not available | Android only |
| `EscUsbPrinter` | `connect` | `EscUSBPrinter.connect` | Not available | Android only |
| `EscUsbPrinter` | `disconnect` | `EscUSBPrinter.disconnect` | Not available | iOS JS wrapper resolves/throws unsupported |
| `EscUsbPrinter` | `printText` | `EscUSBPrinter.printRawData` via JS wrapper | Not available | Android only |
| `EscUsbPrinter` | `printBill` | `EscUSBPrinter.printRawData` via JS wrapper | Not available | Android only |
| `EscUsbPrinter` | `printImage` | `EscUSBPrinter.printImageData` | Not available | Android only |
| `EscUsbPrinter` | `printImageBase64` | `EscUSBPrinter.printImageBase64` | Not available | Android only |
| `EscUsbPrinter` | `printColumnsText` | `EscUSBPrinter.printRawData` via JS wrapper | Not available | Android only |
| `EscUsbPrinter` | `openDrawer` | `EscUSBPrinter.printRawData` via JS wrapper | Not available | Android only |
| `BluetoothPrinter` | `isBluetoothEnabled` | `BluetoothPrinter.isBluetoothEnabled` | `BluetoothPrinter.isBluetoothEnabled` | Supported on both platforms |
| `BluetoothPrinter` | `enableBluetooth` | `BluetoothPrinter.enableBluetooth` | `BluetoothPrinter.enableBluetooth` | Supported on both platforms |
| `BluetoothPrinter` | `disableBluetooth` | `BluetoothPrinter.disableBluetooth` | `BluetoothPrinter.disableBluetooth` | Supported on both platforms |
| `BluetoothPrinter` | `scanDevices` | `BluetoothPrinter.scanDevices` | `BluetoothPrinter.scanDevices` | Supported on both platforms |
| `BluetoothPrinter` | `connect` | `BluetoothPrinter.connect` | `BluetoothPrinter.connect` | Supported on both platforms |
| `BluetoothPrinter` | `disconnect` | `BluetoothPrinter.disconnect` | `BluetoothPrinter.disconnect` | Supported on both platforms |
| `BluetoothPrinter` | `unpaire` | `BluetoothPrinter.unpaire` | Not available | Android only |
| `BluetoothPrinter` | `isDeviceConnected` | `BluetoothPrinter.isDeviceConnected` | Not available | Android only |
| `BluetoothPrinter` | `getConnectedDeviceAddress` | `BluetoothPrinter.getConnectedDeviceAddress` | Not available | Android only |
| `BluetoothPrinter` | `stopScan` | Not available | `BluetoothPrinter.stopScan` | iOS only |
| `EscBluetoothPrinter` | `init` | `EscBluetoothPrinter.init` | `EscBluetoothPrinter.init` | Supported on both platforms |
| `EscBluetoothPrinter` | `printText` | `EscBluetoothPrinter.printText` | `EscBluetoothPrinter.printText` | Supported on both platforms |
| `EscBluetoothPrinter` | `printColumn` | `EscBluetoothPrinter.printColumn` | `EscBluetoothPrinter.printColumn` | Supported on both platforms |
| `EscBluetoothPrinter` | `printPic` | `EscBluetoothPrinter.printPic` | `EscBluetoothPrinter.printPic` | Supported on both platforms |
| `EscBluetoothPrinter` | `printerAlign` | `EscBluetoothPrinter.printerAlign` | `EscBluetoothPrinter.printerAlign` | Supported on both platforms |
| `EscBluetoothPrinter` | `printerUnderLine` | `EscBluetoothPrinter.printerUnderLine` | `EscBluetoothPrinter.printerUnderLine` | Supported on both platforms |
| `EscBluetoothPrinter` | `printerLeftSpace` | `EscBluetoothPrinter.printerLeftSpace` | `EscBluetoothPrinter.printerLeftSpace` | Supported on both platforms |
| `EscBluetoothPrinter` | `printAndFeed` | `EscBluetoothPrinter.printAndFeed` | `EscBluetoothPrinter.printAndFeed` | Supported on both platforms |
| `EscBluetoothPrinter` | `printBarCode` | `EscBluetoothPrinter.printBarCode` | `EscBluetoothPrinter.printBarCode` | Supported on both platforms |
| `EscBluetoothPrinter` | `openDrawer` | `EscBluetoothPrinter.openDrawer` | `EscBluetoothPrinter.openDrawer` | Supported on both platforms |
| `EscBluetoothPrinter` | `cutOnePoint` | `EscBluetoothPrinter.cutOnePoint` | `EscBluetoothPrinter.cutOnePoint` | Supported on both platforms |
| `EscBluetoothPrinter` | `setWidth` | `EscBluetoothPrinter.setWidth` | `EscBluetoothPrinter.setWidth` | Supported on both platforms |
| `EscBluetoothPrinter` | `rotate` | `EscBluetoothPrinter.rotate` | `EscBluetoothPrinter.rotate` | Signature differs slightly by platform |
| `EscBluetoothPrinter` | `setBlob` | `EscBluetoothPrinter.setBlob` | `EscBluetoothPrinter.setBlob` | Supported on both platforms |
| `EscBluetoothPrinter` | `printQRCode` | `EscBluetoothPrinter.printQRCode` | Not exported in current iOS module | Android only in current bridge |
| `TscNetPrinter` | `ping` | `TscNetPrinter.ping` | `TscNetPrinter.ping` | Supported on both platforms |
| `TscNetPrinter` | `connect` | `TscNetPrinter.connect` | `TscNetPrinter.connect` | Supported on both platforms |
| `TscNetPrinter` | `printLabel` | `TscNetPrinter.printLabel` | `TscNetPrinter.printLabel` | Supported on both platforms |
| `TscNetPrinter` | `disconnect` | `TscNetPrinter.disconnect` | `TscNetPrinter.disconnect` | Supported on both platforms |
| `TscNetPrinter` | `sendDataToPrinter` | `TscNetPrinter.sendDataToPrinter` | Not exported | Android only |
| `TscBluetoothPrinter` | `printLabel` | `TscBluetoothPrinter.printLabel` | `TscBluetoothPrinter.printLabel` | Supported on both platforms |
| `TscUsbPrinter` | `connect` | `TscUsbPrinter.connect` | Not available | Android only |
| `TscUsbPrinter` | `printLabel` | `TscUsbPrinter.printLabel` | Not available | Android only |
| `TscUsbPrinter` | `getDevices` | `TscUsbPrinter.getDevices` | Not available | Android only |

### Guidance and platform support notes

- Prefer `EscNetPrinter` for cross-platform ESC/POS over LAN.
- Use `EscUsbPrinter` and `TscUsbPrinter` only on Android.
- `ping(host, timeoutMs?)` uses `TscNetPrinter.ping` to pre-check network reachability.
- iOS `EscNetPrinter` includes low-level helpers (`printRaw`, `sendHex`) that are not exposed by Android.
- Bluetooth capability sets are similar but not identical across Android/iOS; verify method availability before relying on platform-specific calls.
