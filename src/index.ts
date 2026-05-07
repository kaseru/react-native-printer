import { EscNetPrinter, EscUsbPrinter, COMMANDS, BluetoothPrinter, EscBluetoothPrinter, TscBluetoothPrinter, TscNetPrinter, TscUsbPrinter, TscCommand } from './printer';

export { EscBluetoothPrinter, BluetoothPrinter, TscBluetoothPrinter, COMMANDS, EscNetPrinter, EscUsbPrinter, TscNetPrinter, TscUsbPrinter, TscCommand };

export function ping(host: string, timeoutMs: number = 1000) {
  return TscNetPrinter.ping(host, timeoutMs);
}
