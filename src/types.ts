export type PrinterTransport = 'bluetooth' | 'wifi' | 'usb';

export type PrinterLanguage = 'escpos' | 'tsc';

export interface BasePrinterTarget {
  transport: PrinterTransport;
  language: PrinterLanguage;
}

export interface BluetoothTarget extends BasePrinterTarget {
  transport: 'bluetooth';
  address: string;
  name?: string;
}

export interface WifiTarget extends BasePrinterTarget {
  transport: 'wifi';
  host: string;
  port: number;
  timeout?: number;
}

export interface UsbTarget extends BasePrinterTarget {
  transport: 'usb';
  vendorId: string;
  productId: string;
  deviceName?: string;
}

export type PrinterTarget = BluetoothTarget | WifiTarget | UsbTarget;

export interface ReceiptPrintOptions {
  beep?: boolean;
  cut?: boolean;
  tailingLine?: boolean;
  encoding?: string;
}

export interface ImagePrintOptions extends ReceiptPrintOptions {
  imageWidth?: number;
  imageHeight?: number;
  paddingX?: number;
  printerWidth?: 58 | 80;
}

export interface LabelPrintOptions {
  width: number;
  height: number;
  gap?: number;
  direction?: number | string;
  reference?: [number, number];
  tear?: 'ON' | 'OFF';
  sound?: number;
  text?: any[];
  barcode?: any[];
  qrcode?: any[];
  image?: any[];
}
