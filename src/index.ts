import {
  EscNetPrinter,
  EscUsbPrinter,
  COMMANDS,
  BluetoothManager,
  EscBluetoothPrinter,
  TscBluetoothPrinter,
  TscNetPrinter,
  TscUsbPrinter,
} from './printer';

export {
  EscBluetoothPrinter,
  BluetoothManager,
  TscBluetoothPrinter,
  COMMANDS,
  EscNetPrinter,
  EscUsbPrinter,
  TscNetPrinter,
  TscUsbPrinter,
};

export function ping(host: string, timeoutMs: number = 1000) {
  if (TscNetPrinter?.ping) {
    return TscNetPrinter.ping(host, timeoutMs);
  }
  throw new Error('Network printer ping is not available');
}
