export * from './types';
export * from './legacy/bluetooth';
export * from './legacy/thermal';

import { BluetoothEscpos, BluetoothTsc } from './legacy/bluetooth';
import { NetPrinter, USBPrinter, BLEPrinter } from './legacy/thermal';
import type { LabelPrintOptions, PrinterTarget, ReceiptPrintOptions, ImagePrintOptions } from './types';

const resolvePrinterByTarget = (target: PrinterTarget) => {
  if (target.transport === 'wifi') return NetPrinter;
  if (target.transport === 'usb') return USBPrinter;
  if (target.transport === 'bluetooth' && target.language === 'tsc') return BluetoothTsc;
  if (target.transport === 'bluetooth' && target.language === 'escpos') return BluetoothEscpos;
  throw new Error('Unsupported printer target');
};

export const Printer = {
  async connect(target: PrinterTarget) {
    if (target.transport === 'wifi') {
      const { host, port } = target;
      return NetPrinter.connectPrinter(host, port);
    }

    if (target.transport === 'usb') {
      return USBPrinter.connectPrinter(target.vendorId, target.productId);
    }

    if (target.transport === 'bluetooth') {
      if (target.language === 'tsc') {
        return BluetoothTsc.connect?.(target.address) ?? BluetoothEscpos.connect(target.address);
      }
      return BluetoothEscpos.connect(target.address);
    }

    throw new Error('Unsupported printer target');
  },

  async disconnect(target?: Partial<PrinterTarget>) {
    if (!target) {
      await NetPrinter.closeConn?.();
      await USBPrinter.closeConn?.();
      await BLEPrinter.closeConn?.();
      return;
    }

    if (target.transport === 'wifi') {
      await NetPrinter.closeConn?.();
      return;
    }

    if (target.transport === 'usb') {
      await USBPrinter.closeConn?.();
      return;
    }

    if (target.transport === 'bluetooth') {
      if (target.language === 'tsc') {
        await BluetoothTsc.closeConn?.();
        return;
      }
      await BluetoothEscpos.closeConn?.();
    }
  },

  getDriver(target: PrinterTarget) {
    return resolvePrinterByTarget(target);
  },

  printText(text: string, opts: ReceiptPrintOptions = {}) {
    return NetPrinter.printText(text, opts);
  },

  printReceipt(text: string, opts: ReceiptPrintOptions = {}) {
    return NetPrinter.printBill(text, opts);
  },

  printImageBase64(base64: string, opts: ImagePrintOptions = {}) {
    return NetPrinter.printImageBase64(base64, opts as any);
  },

  printLabel(options: LabelPrintOptions) {
    return BluetoothTsc.printLabel(options as any);
  },
};
