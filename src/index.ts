import { NativeModules } from 'react-native';
import { NetEscPrinter, USBEscPrinter } from './legacy/thermal';
import { BluetoothManager, BluetoothEscPrinter, BluetoothTscPrinter } from './legacy/bluetooth';
import { COMMANDS } from './legacy/thermal';

export {
  BluetoothEscPrinter,
  BluetoothManager,
  BluetoothTscPrinter,
  COMMANDS,
  NetEscPrinter,
  USBEscPrinter,
};

export const TscNetPrinterModule = NativeModules.XTscPrinterModule || NativeModules.TscPrinterModule;
export const TscUsbPrinterModule = NativeModules.XUsbPrinterModule || NativeModules.UsbPrinterModule;
export function ping(host: string, timeoutMs: number = 1000) {
  if (TscNetPrinterModule?.ping) {
    return TscNetPrinterModule.ping(host, timeoutMs);
  }
  throw new Error('Network printer ping is not available');
}
