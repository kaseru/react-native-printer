import { EscNetPrinter, EscUsbPrinter, COMMANDS, BluetoothPrinter, EscBluetoothPrinter, TscBluetoothPrinter, TscNetPrinter, TscUsbPrinter } from './printer';

export { EscBluetoothPrinter, BluetoothPrinter, TscBluetoothPrinter, COMMANDS, EscNetPrinter, EscUsbPrinter, TscNetPrinter, TscUsbPrinter };

export function ping(host: string, timeoutMs: number = 1000) {
  return TscNetPrinter.ping(host, timeoutMs);
}
