import { NativeModules } from 'react-native';
import { NetEscPrinter, USBEscPrinter } from './legacy/thermal';
import { BluetoothManager, BluetoothEscpos as BluetoothEscPrinter, BluetoothTsc as BluetoothTscPrinter } from './legacy/bluetooth';
import { COMMANDS } from './legacy/thermal';

export {
  BluetoothEscPrinter,
  BluetoothManager,
  BluetoothTscPrinter,
  COMMANDS,
  NetEscPrinter as NetEscPrinter,
  USBEscPrinter as USBEscPrinter,
};

const TscLabelPrinterModule = NativeModules.XTscPrinterModule || NativeModules.TscPrinterModule;

export const TscPrinterModule = TscLabelPrinterModule;
export const TscNetEscPrinterModule = TscLabelPrinterModule;
export const UsbPrinterModule = NativeModules.XUsbPrinterModule || NativeModules.UsbPrinterModule;
export const TscUsbPrinterModule = UsbPrinterModule;
export function ping(host: string, timeoutMs: number = 1000) {
  if (TscLabelPrinterModule?.ping) {
    return TscLabelPrinterModule.ping(host, timeoutMs);
  }
  throw new Error('Network printer ping is not available');
}
