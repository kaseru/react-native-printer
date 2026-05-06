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

  await EscNetPrinter.closeConn();
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
  await EscUsbPrinter.closeConn();
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
