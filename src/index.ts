import { NativeModules } from 'react-native';
import { NetEscPrinter, USBEscPrinter, COMMANDS } from './printer/thermal';
import { BluetoothManager, BluetoothEscPrinter, TscBluetoothPrinter } from './printer/bluetooth';

export {
  BluetoothEscPrinter,
  BluetoothManager,
  TscBluetoothPrinter,
  COMMANDS,
  NetEscPrinter,
  USBEscPrinter,
};

export const TscNetPrinterModule = NativeModules.TscNetPrinterModule;
export const TscUsbPrinterModule = NativeModules.UsbPrinterModule;
export function ping(host: string, timeoutMs: number = 1000) {
  if (TscNetPrinterModule?.ping) {
    return TscNetPrinterModule.ping(host, timeoutMs);
  }
  throw new Error('Network printer ping is not available');
}
