import { NativeModules, NativeEventEmitter, Platform } from "react-native";

import * as EPToolkit from "./utils/EPToolkit";
import { processColumnText } from "./utils/print-column";
import { COMMANDS } from "./utils/printer-commands";
import { connectToHost } from "./utils/net-connect";

const RNUSBEscPrinter = NativeModules.XRNUSBEscPrinter || NativeModules.RNUSBEscPrinter;
const RNNetEscPrinterLegacy = NativeModules.XRNNetEscPrinter || NativeModules.RNNetEscPrinter;
const RNNetEscPrinterRaw = NativeModules.RNNetEscPrinterRaw;

const getRNNetEscPrinter = () => {
  if (Platform.OS === "ios" && RNNetEscPrinterRaw) {
    return RNNetEscPrinterRaw;
  }
  return RNNetEscPrinterLegacy;
};

export interface PrinterOptions {
  beep?: boolean;
  cut?: boolean;
  tailingLine?: boolean;
  encoding?: string;
}

export enum PrinterWidth {
  "58mm" = 58,
  "80mm" = 80,
}

export interface PrinterImageOptions {
  beep?: boolean;
  cut?: boolean;
  tailingLine?: boolean;
  encoding?: string;
  imageWidth?: number;
  imageHeight?: number;
  printerWidthType?: PrinterWidth;
  // only ios
  paddingX?: number;
}

export interface IUSBEscPrinter {
  device_name: string;
  vendor_id: string;
  product_id: string;
}

export interface INetEscPrinter {
  host: string;
  port: number;
}

export enum ColumnAlignment {
  LEFT,
  CENTER,
  RIGHT,
}

const textTo64Buffer = (text: string, opts: PrinterOptions) => {
  const defaultOptions = {
    beep: false,
    cut: false,
    tailingLine: false,
    encoding: "UTF8",
  };

  const options = {
    ...defaultOptions,
    ...opts,
  };

  const fixAndroid = "\n";
  const buffer = EPToolkit.exchange_text(text + fixAndroid, options);
  return buffer.toString("base64");
};

const billTo64Buffer = (text: string, opts: PrinterOptions) => {
  const defaultOptions = {
    beep: true,
    cut: true,
    encoding: "UTF8",
    tailingLine: true,
  };
  const options = {
    ...defaultOptions,
    ...opts,
  };
  const buffer = EPToolkit.exchange_text(text, options);
  return buffer.toString("base64");
};

const textPreprocessingIOS = (text: string, canCut = true, beep = true) => {
  const options = {
    beep: beep,
    cut: canCut,
  };
  return {
    text: text
      .replace(/<\/?CB>/g, "")
      .replace(/<\/?CM>/g, "")
      .replace(/<\/?CD>/g, "")
      .replace(/<\/?C>/g, "")
      .replace(/<\/?D>/g, "")
      .replace(/<\/?B>/g, "")
      .replace(/<\/?M>/g, ""),
    opts: options,
  };
};

const USBEscPrinter = {
  init: (): Promise<void> =>
    new Promise((resolve, reject) =>
      RNUSBEscPrinter.init(
        () => resolve(),
        (error: Error) => reject(error)
      )
    ),

  getDeviceList: (): Promise<IUSBEscPrinter[]> =>
    new Promise((resolve, reject) =>
      RNUSBEscPrinter.getDeviceList(
        (printers: IUSBEscPrinter[]) => resolve(printers),
        (error: Error) => reject(error)
      )
    ),

  connectPrinter: (vendorId: string, productId: string): Promise<IUSBEscPrinter> =>
    new Promise((resolve, reject) =>
      RNUSBEscPrinter.connectPrinter(
        vendorId,
        productId,
        (printer: IUSBEscPrinter) => resolve(printer),
        (error: Error) => reject(error)
      )
    ),

  closeConn: (): Promise<void> =>
    new Promise((resolve) => {
      RNUSBEscPrinter.closeConn();
      resolve();
    }),

  printText: (text: string, opts: PrinterOptions = {}): void =>
    RNUSBEscPrinter.printRawData(textTo64Buffer(text, opts), (error: Error) =>
      console.warn(error)
    ),

  printBill: (text: string, opts: PrinterOptions = {}): void =>
    RNUSBEscPrinter.printRawData(billTo64Buffer(text, opts), (error: Error) =>
      console.warn(error)
    ),

  printImage: function (imgUrl: string, opts: PrinterImageOptions = {}) {
    if (Platform.OS === "ios") {
      RNUSBEscPrinter.printImageData(imgUrl, opts, (error: Error) =>
        console.warn(error)
      );
    } else {
      RNUSBEscPrinter.printImageData(
        imgUrl,
        opts?.imageWidth ?? 0,
        opts?.imageHeight ?? 0,
        (error: Error) => console.warn(error)
      );
    }
  },

  printImageBase64: function (Base64: string, opts: PrinterImageOptions = {}) {
    if (Platform.OS === "ios") {
      RNUSBEscPrinter.printImageBase64(Base64, opts, (error: Error) =>
        console.warn(error)
      );
    } else {
      RNUSBEscPrinter.printImageBase64(
        Base64,
        opts?.imageWidth ?? 0,
        opts?.imageHeight ?? 0,
        (error: Error) => console.warn(error)
      );
    }
  },

  printRaw: (text: string): void => {
    if (Platform.OS === "ios") {
    } else {
      RNUSBEscPrinter.printRawData(text, (error: Error) => console.warn(error));
    }
  },

  printColumnsText: (
    texts: string[],
    columnWidth: number[],
    columnAlignment: ColumnAlignment[],
    columnStyle: string[],
    opts: PrinterOptions = {}
  ): void => {
    const result = processColumnText(
      texts,
      columnWidth,
      columnAlignment,
      columnStyle
    );
    RNUSBEscPrinter.printRawData(textTo64Buffer(result, opts), (error: Error) =>
      console.warn(error)
    );
  },
};

const NetEscPrinter = {
  init: (): Promise<void> =>
    new Promise((resolve, reject) =>
      getRNNetEscPrinter().init(
        () => resolve(),
        (error: Error) => reject(error)
      )
    ),

  getDeviceList: (): Promise<INetEscPrinter[]> =>
    new Promise((resolve, reject) =>
      getRNNetEscPrinter().getDeviceList(
        (printers: INetEscPrinter[]) => resolve(printers),
        (error: Error) => reject(error)
      )
    ),

  connectPrinter: (
    host: string,
    port: number,
    timeout?: number
  ): Promise<INetEscPrinter> =>
    new Promise(async (resolve, reject) => {
      try {
        await connectToHost(host, timeout);
        getRNNetEscPrinter().connectPrinter(
          host,
          port,
          (printer: INetEscPrinter) => resolve(printer),
          (error: Error) => reject(error)
        );
      } catch (error) {
        reject(error?.message || `Connect to ${host} fail`);
      }
    }),

  closeConn: (): Promise<void> =>
    new Promise((resolve) => {
      getRNNetEscPrinter().closeConn();
      resolve();
    }),

  printText: (text: string, opts = {}): void => {
    if (Platform.OS === "ios") {
      const processedText = textPreprocessingIOS(text, false, false);
      getRNNetEscPrinter().printRawData(
        processedText.text,
        processedText.opts,
        (error: Error) => console.warn(error)
      );
    } else {
      getRNNetEscPrinter().printRawData(textTo64Buffer(text, opts), (error: Error) =>
        console.warn(error)
      );
    }
  },

  printBill: (text: string, opts: PrinterOptions = {}): void => {
    if (Platform.OS === "ios") {
      const processedText = textPreprocessingIOS(
        text,
        opts?.cut ?? true,
        opts.beep ?? true
      );
      getRNNetEscPrinter().printRawData(
        processedText.text,
        processedText.opts,
        (error: Error) => console.warn(error)
      );
    } else {
      getRNNetEscPrinter().printRawData(billTo64Buffer(text, opts), (error: Error) =>
        console.warn(error)
      );
    }
  },

  printImage: function (imgUrl: string, opts: PrinterImageOptions = {}) {
    if (Platform.OS === "ios") {
      getRNNetEscPrinter().printImageData(imgUrl, opts, (error: Error) =>
        console.warn(error)
      );
    } else {
      getRNNetEscPrinter().printImageData(
        imgUrl,
        opts?.imageWidth ?? 0,
        opts?.imageHeight ?? 0,
        (error: Error) => console.warn(error)
      );
    }
  },

  printImageBase64: function (Base64: string, opts: PrinterImageOptions = {}) {
    if (Platform.OS === "ios") {
      getRNNetEscPrinter().printImageBase64(Base64, opts, (error: Error) =>
        console.warn(error)
      );
    } else {
      getRNNetEscPrinter().printImageBase64(
        Base64,
        opts?.imageWidth ?? 0,
        opts?.imageHeight ?? 0,
        (error: Error) => console.warn(error)
      );
    }
  },

  printRaw: (text: string): void => {
    if (Platform.OS === "ios") {
    } else {
      getRNNetEscPrinter().printRawData(text, (error: Error) => console.warn(error));
    }
  },

  printColumnsText: (
    texts: string[],
    columnWidth: number[],
    columnAlignment: ColumnAlignment[],
    columnStyle: string[] = [],
    opts: PrinterOptions = {}
  ): void => {
    const result = processColumnText(
      texts,
      columnWidth,
      columnAlignment,
      columnStyle
    );
    if (Platform.OS === "ios") {
      const processedText = textPreprocessingIOS(result, false, false);
      getRNNetEscPrinter().printRawData(
        processedText.text,
        processedText.opts,
        (error: Error) => console.warn(error)
      );
    } else {
      getRNNetEscPrinter().printRawData(textTo64Buffer(result, opts), (error: Error) =>
        console.warn(error)
      );
    }
  },
};

const NetEscPrinterEventEmitter =
  Platform.OS === "ios"
    ? new NativeEventEmitter(getRNNetEscPrinter())
    : new NativeEventEmitter();

export { COMMANDS, NetEscPrinter, USBEscPrinter, NetEscPrinterEventEmitter };

export enum RN_THERMAL_RECEIPT_PRINTER_EVENTS {
  EVENT_NET_PRINTER_SCANNED_SUCCESS = "scannerResolved",
  EVENT_NET_PRINTER_SCANNING = "scannerRunning",
  EVENT_NET_PRINTER_SCANNED_ERROR = "registerError",
}
