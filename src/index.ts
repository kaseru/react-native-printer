import { NativeModules } from 'react-native';
import {
  EscNetPrinter,
  EscUSBPrinter,
  COMMANDS,
  BluetoothManager,
  EscBluetoothPrinter,
  TscBluetoothPrinter,
} from './printer';

export {
  EscBluetoothPrinter,
  BluetoothManager,
  TscBluetoothPrinter,
  COMMANDS,
  EscNetPrinter,
  EscUSBPrinter,
};

export const TscNetPrinterModule = NativeModules.TscNetPrinterModule;
export const TscUsbPrinterModule = NativeModules.UsbPrinterModule;
export function ping(host: string, timeoutMs: number = 1000) {
  if (TscNetPrinterModule?.ping) {
    return TscNetPrinterModule.ping(host, timeoutMs);
  }
  throw new Error('Network printer ping is not available');
}
