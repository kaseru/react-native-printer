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

const TscLabelPrinterModule = NativeModules.XTscPrinterModule || NativeModules.TscPrinterModule;

export const TscPrinterModule = NativeModules.XTscPrinterModule || NativeModules.TscPrinterModule;
export const TscNetEscPrinterModule = NativeModules.XTscPrinterModule || NativeModules.TscPrinterModule;
export const UsbPrinterModule = NativeModules.XUsbPrinterModule || NativeModules.UsbPrinterModule;
export const TscUsbPrinterModule = NativeModules.XUsbPrinterModule || NativeModules.UsbPrinterModule;
export function ping(host: string, timeoutMs: number = 1000) {
  if (TscLabelPrinterModule?.ping) {
    return TscLabelPrinterModule.ping(host, timeoutMs);
  }
  throw new Error('Network printer ping is not available');
}
