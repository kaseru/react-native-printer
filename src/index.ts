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

export const TscNetPrinter = NativeModules.TscNetPrinter;
export const TscUsbPrinter = NativeModules.UsbPrinter;
export function ping(host: string, timeoutMs: number = 1000) {
  if (TscNetPrinter?.ping) {
    return TscNetPrinter.ping(host, timeoutMs);
  }
  throw new Error('Network printer ping is not available');
}
