// Thin wrapper around the current Kaseru-maintained bluetooth printer base.
// Source reference: https://github.com/kaseru/react-native-bluetooth-escpos-printer

// eslint-disable-next-line @typescript-eslint/no-var-requires
const raw = require('./raw');

export const BluetoothManager = raw.BluetoothManager;
export const BluetoothEscpos = raw.BluetoothEscposPrinter;
export const BluetoothTsc = raw.BluetoothTscPrinter;
