import { NativeModules, NativeEventEmitter, Platform } from "react-native";

import * as EPToolkit from "./utils/EPToolkit";
import { processColumnText } from "./utils/print-column";
import { COMMANDS } from "./utils/printer-commands";
import { connectToHost } from "./utils/net-connect";

const RNEscUSBPrinter = NativeModules.RNEscUSBPrinter;
const RNEscNetPrinterLegacy = NativeModules.RNEscNetPrinter;
const RNEscNetPrinterRaw = NativeModules.RNEscNetPrinterRaw;

const getRNEscNetPrinter = () => {
  if (Platform.OS === "ios" && RNEscNetPrinterRaw) {
    return RNEscNetPrinterRaw;
  }
  return RNEscNetPrinterLegacy;
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

export interface IEscUSBPrinter {
  device_name: string;
  vendor_id: string;
  product_id: string;
}

export interface IEscNetPrinter {
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

const EscUSBPrinter = {
  init: (): Promise<void> =>
    new Promise((resolve, reject) =>
      RNEscUSBPrinter.init(
        () => resolve(),
        (error: Error) => reject(error)
      )
    ),

  getDeviceList: (): Promise<IEscUSBPrinter[]> =>
    new Promise((resolve, reject) =>
      RNEscUSBPrinter.getDeviceList(
        (printers: IEscUSBPrinter[]) => resolve(printers),
        (error: Error) => reject(error)
      )
    ),

  connectPrinter: (vendorId: string, productId: string): Promise<IEscUSBPrinter> =>
    new Promise((resolve, reject) =>
      RNEscUSBPrinter.connectPrinter(
        vendorId,
        productId,
        (printer: IEscUSBPrinter) => resolve(printer),
        (error: Error) => reject(error)
      )
    ),

  closeConn: (): Promise<void> =>
    new Promise((resolve) => {
      RNEscUSBPrinter.closeConn();
      resolve();
    }),

  printText: (text: string, opts: PrinterOptions = {}): void =>
    RNEscUSBPrinter.printRawData(textTo64Buffer(text, opts), (error: Error) =>
      console.warn(error)
    ),

  printBill: (text: string, opts: PrinterOptions = {}): void =>
    RNEscUSBPrinter.printRawData(billTo64Buffer(text, opts), (error: Error) =>
      console.warn(error)
    ),

  printImage: function (imgUrl: string, opts: PrinterImageOptions = {}) {
    if (Platform.OS === "ios") {
      RNEscUSBPrinter.printImageData(imgUrl, opts, (error: Error) =>
        console.warn(error)
      );
    } else {
      RNEscUSBPrinter.printImageData(
        imgUrl,
        opts?.imageWidth ?? 0,
        opts?.imageHeight ?? 0,
        (error: Error) => console.warn(error)
      );
    }
  },

  printImageBase64: function (Base64: string, opts: PrinterImageOptions = {}) {
    if (Platform.OS === "ios") {
      RNEscUSBPrinter.printImageBase64(Base64, opts, (error: Error) =>
        console.warn(error)
      );
    } else {
      RNEscUSBPrinter.printImageBase64(
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
      RNEscUSBPrinter.printRawData(text, (error: Error) => console.warn(error));
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
    RNEscUSBPrinter.printRawData(textTo64Buffer(result, opts), (error: Error) =>
      console.warn(error)
    );
  },
};

const EscNetPrinter = {
  init: (): Promise<void> =>
    new Promise((resolve, reject) =>
      getRNEscNetPrinter().init(
        () => resolve(),
        (error: Error) => reject(error)
      )
    ),

  getDeviceList: (): Promise<IEscNetPrinter[]> =>
    new Promise((resolve, reject) =>
      getRNEscNetPrinter().getDeviceList(
        (printers: IEscNetPrinter[]) => resolve(printers),
        (error: Error) => reject(error)
      )
    ),

  connectPrinter: (
    host: string,
    port: number,
    timeout?: number
  ): Promise<IEscNetPrinter> =>
    new Promise(async (resolve, reject) => {
      try {
        await connectToHost(host, timeout);
        getRNEscNetPrinter().connectPrinter(
          host,
          port,
          (printer: IEscNetPrinter) => resolve(printer),
          (error: Error) => reject(error)
        );
      } catch (error) {
        reject(error?.message || `Connect to ${host} fail`);
      }
    }),

  closeConn: (): Promise<void> =>
    new Promise((resolve) => {
      getRNEscNetPrinter().closeConn();
      resolve();
    }),

  printText: (text: string, opts = {}): void => {
    if (Platform.OS === "ios") {
      const processedText = textPreprocessingIOS(text, false, false);
      getRNEscNetPrinter().printRawData(
        processedText.text,
        processedText.opts,
        (error: Error) => console.warn(error)
      );
    } else {
      getRNEscNetPrinter().printRawData(textTo64Buffer(text, opts), (error: Error) =>
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
      getRNEscNetPrinter().printRawData(
        processedText.text,
        processedText.opts,
        (error: Error) => console.warn(error)
      );
    } else {
      getRNEscNetPrinter().printRawData(billTo64Buffer(text, opts), (error: Error) =>
        console.warn(error)
      );
    }
  },

  printImage: function (imgUrl: string, opts: PrinterImageOptions = {}) {
    if (Platform.OS === "ios") {
      getRNEscNetPrinter().printImageData(imgUrl, opts, (error: Error) =>
        console.warn(error)
      );
    } else {
      getRNEscNetPrinter().printImageData(
        imgUrl,
        opts?.imageWidth ?? 0,
        opts?.imageHeight ?? 0,
        (error: Error) => console.warn(error)
      );
    }
  },

  printImageBase64: function (Base64: string, opts: PrinterImageOptions = {}) {
    if (Platform.OS === "ios") {
      getRNEscNetPrinter().printImageBase64(Base64, opts, (error: Error) =>
        console.warn(error)
      );
    } else {
      getRNEscNetPrinter().printImageBase64(
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
      getRNEscNetPrinter().printRawData(text, (error: Error) => console.warn(error));
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
      getRNEscNetPrinter().printRawData(
        processedText.text,
        processedText.opts,
        (error: Error) => console.warn(error)
      );
    } else {
      getRNEscNetPrinter().printRawData(textTo64Buffer(result, opts), (error: Error) =>
        console.warn(error)
      );
    }
  },
};

const EscNetPrinterEventEmitter =
  Platform.OS === "ios"
    ? new NativeEventEmitter(getRNEscNetPrinter())
    : new NativeEventEmitter();

export { COMMANDS, EscNetPrinter, EscUSBPrinter, EscNetPrinterEventEmitter };

export enum RN_THERMAL_RECEIPT_PRINTER_EVENTS {
  EVENT_NET_PRINTER_SCANNED_SUCCESS = "scannerResolved",
  EVENT_NET_PRINTER_SCANNING = "scannerRunning",
  EVENT_NET_PRINTER_SCANNED_ERROR = "registerError",
}
