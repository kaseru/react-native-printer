import { NativeModules, NativeEventEmitter, Platform } from "react-native";
import { Buffer } from "buffer";

import * as EPToolkit from "./utils/EPToolkit";
import { processColumnText } from "./utils/print-column";
import { COMMANDS } from "./utils/printer-commands";
import { connectToHost } from "./utils/net-connect";

const {
  EscUsbPrinter: EscUsbPrinterModule,
  EscNetPrinter: EscNetPrinterModule,
  BluetoothPrinter,
  EscBluetoothPrinter,
  TscBluetoothPrinter,
  TscNetPrinter,
  TscUsbPrinter,
} = NativeModules;

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

export interface IEscUsbPrinter {
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

const buildOpenDrawerCommandBase64 = (
  pin: number = 0,
  onTime: number = 37,
  offTime: number = 80
) => {
  const command = [0x1b, 0x70, pin & 0xff, onTime & 0xff, offTime & 0xff];
  return Buffer.from(command).toString("base64");
};

const createUnsupportedIOSUSBError = (printerType: string) =>
  new Error(`${printerType} is not supported on iOS`);

const rejectUnsupportedIOSUSB = <T>(printerType: string): Promise<T> =>
  Promise.reject(createUnsupportedIOSUSBError(printerType));

const throwUnsupportedIOSUSB = (printerType: string): never => {
  throw createUnsupportedIOSUSBError(printerType);
};

const EscUsbPrinter = {
  init: (): Promise<void> =>
    Platform.OS === "ios"
      ? rejectUnsupportedIOSUSB("ESC USB printing")
      :
    new Promise((resolve, reject) =>
      EscUsbPrinterModule.init(
        () => resolve(),
        (error: Error) => reject(error)
      )
    ),

  getDeviceList: (): Promise<IEscUsbPrinter[]> =>
    Platform.OS === "ios"
      ? rejectUnsupportedIOSUSB("ESC USB printing")
      :
    new Promise((resolve, reject) =>
      EscUsbPrinterModule.getDeviceList(
        (printers: IEscUsbPrinter[]) => resolve(printers),
        (error: Error) => reject(error)
      )
    ),

  connect: (vendorId: string, productId: string): Promise<IEscUsbPrinter> =>
    Platform.OS === "ios"
      ? rejectUnsupportedIOSUSB("ESC USB printing")
      :
    new Promise((resolve, reject) =>
      EscUsbPrinterModule.connect(
        vendorId,
        productId,
        (printer: IEscUsbPrinter) => resolve(printer),
        (error: Error) => reject(error)
      )
    ),

  closeConn: (): Promise<void> =>
    Platform.OS === "ios"
      ? Promise.resolve()
      :
    new Promise((resolve) => {
      EscUsbPrinterModule.closeConn();
      resolve();
    }),

  printText: (text: string, opts: PrinterOptions = {}): void => {
    if (Platform.OS === "ios") {
      throwUnsupportedIOSUSB("ESC USB printing");
    }
    EscUsbPrinterModule.printRawData(textTo64Buffer(text, opts), (error: Error) =>
      console.warn(error)
    );
  },

  printBill: (text: string, opts: PrinterOptions = {}): void => {
    if (Platform.OS === "ios") {
      throwUnsupportedIOSUSB("ESC USB printing");
    }
    EscUsbPrinterModule.printRawData(billTo64Buffer(text, opts), (error: Error) =>
      console.warn(error)
    );
  },

  printImage: function (imgUrl: string, opts: PrinterImageOptions = {}) {
    if (Platform.OS === "ios") {
      throwUnsupportedIOSUSB("ESC USB printing");
    }
    EscUsbPrinterModule.printImageData(
      imgUrl,
      opts?.imageWidth ?? 0,
      opts?.imageHeight ?? 0,
      (error: Error) => console.warn(error)
    );
  },

  printImageBase64: function (Base64: string, opts: PrinterImageOptions = {}) {
    if (Platform.OS === "ios") {
      throwUnsupportedIOSUSB("ESC USB printing");
    }
    EscUsbPrinterModule.printImageBase64(
      Base64,
      opts?.imageWidth ?? 0,
      opts?.imageHeight ?? 0,
      (error: Error) => console.warn(error)
    );
  },

  printColumnsText: (
    texts: string[],
    columnWidth: number[],
    columnAlignment: ColumnAlignment[],
    columnStyle: string[],
    opts: PrinterOptions = {}
  ): void => {
    if (Platform.OS === "ios") {
      throwUnsupportedIOSUSB("ESC USB printing");
    }
    const result = processColumnText(
      texts,
      columnWidth,
      columnAlignment,
      columnStyle
    );
    EscUsbPrinterModule.printRawData(textTo64Buffer(result, opts), (error: Error) =>
      console.warn(error)
    );
  },

  openDrawer: (pin: number = 0, onTime: number = 37, offTime: number = 80): void => {
    if (Platform.OS === "ios") {
      throwUnsupportedIOSUSB("ESC USB printing");
    }
    EscUsbPrinter.printText(COMMANDS.CASH_DRAWER.CD_KICK_2);
    EscUsbPrinterModule.printRawData(
      buildOpenDrawerCommandBase64(pin, onTime, offTime),
      (error: Error) => console.warn(error)
    );
  },
};

const EscNetPrinter = {
  init: (): Promise<void> =>
    new Promise((resolve, reject) =>
      EscNetPrinterModule.init(
        () => resolve(),
        (error: Error) => reject(error)
      )
    ),

  getDeviceList: (): Promise<IEscNetPrinter[]> =>
    new Promise((resolve, reject) =>
      EscNetPrinterModule.getDeviceList(
        (printers: IEscNetPrinter[]) => resolve(printers),
        (error: Error) => reject(error)
      )
    ),

  connect: (
    host: string,
    port: number,
    timeout?: number
  ): Promise<IEscNetPrinter> =>
    new Promise(async (resolve, reject) => {
      try {
        await connectToHost(host, timeout);
        EscNetPrinterModule.connect(
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
      EscNetPrinterModule.closeConn();
      resolve();
    }),

  printText: (text: string, opts = {}): void => {
    if (Platform.OS === "ios") {
      const processedText = textPreprocessingIOS(text, false, false);
      EscNetPrinterModule.printRawData(
        processedText.text,
        processedText.opts,
        (error: Error) => console.warn(error)
      );
    } else {
      EscNetPrinterModule.printRawData(textTo64Buffer(text, opts), (error: Error) =>
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
      EscNetPrinterModule.printRawData(
        processedText.text,
        processedText.opts,
        (error: Error) => console.warn(error)
      );
    } else {
      EscNetPrinterModule.printRawData(billTo64Buffer(text, opts), (error: Error) =>
        console.warn(error)
      );
    }
  },

  printImage: function (imgUrl: string, opts: PrinterImageOptions = {}) {
    if (Platform.OS === "ios") {
      EscNetPrinterModule.printImageData(imgUrl, opts, (error: Error) =>
        console.warn(error)
      );
    } else {
      EscNetPrinterModule.printImageData(
        imgUrl,
        opts?.imageWidth ?? 0,
        opts?.imageHeight ?? 0,
        (error: Error) => console.warn(error)
      );
    }
  },

  printImageBase64: function (Base64: string, opts: PrinterImageOptions = {}) {
    if (Platform.OS === "ios") {
      EscNetPrinterModule.printImageBase64(Base64, opts, (error: Error) =>
        console.warn(error)
      );
    } else {
      EscNetPrinterModule.printImageBase64(
        Base64,
        opts?.imageWidth ?? 0,
        opts?.imageHeight ?? 0,
        (error: Error) => console.warn(error)
      );
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
      EscNetPrinterModule.printRawData(
        processedText.text,
        processedText.opts,
        (error: Error) => console.warn(error)
      );
    } else {
      EscNetPrinterModule.printRawData(textTo64Buffer(result, opts), (error: Error) =>
        console.warn(error)
      );
    }
  },

  openDrawer: (pin: number = 0, onTime: number = 37, offTime: number = 80): void => {
    EscNetPrinter.printText(COMMANDS.CASH_DRAWER.CD_KICK_2);
    if (Platform.OS !== "ios") {
      EscNetPrinterModule.printRawData(
        buildOpenDrawerCommandBase64(pin, onTime, offTime),
        (error: Error) => console.warn(error)
      );
    }
  },
};


const bluetoothConnectWithTimeout = (
  address: string,
  timeoutMs: number = 2000
): Promise<{ status: number; message: string }> =>
  new Promise((resolve) => {
    let settled = false;

    BluetoothPrinter.connect(address).then(
      () => {
        if (settled) return;
        settled = true;
        resolve({ status: 1, message: "Connected" });
      },
      () => {
        if (settled) return;
        settled = true;
        resolve({ status: 0, message: "Error" });
      }
    );

    setTimeout(() => {
      if (settled) return;
      settled = true;
      resolve({ status: -1, message: "Timeout" });
    }, timeoutMs);
  });

const connect = async (
  address: string,
  timeoutMs: number = 2000,
  retryCount: number = 3
): Promise<{ status: number; message: string }> => {
  let result = { status: -1, message: "Timeout" };
  for (let i = 0; i < retryCount; i += 1) {
    result = await bluetoothConnectWithTimeout(address, timeoutMs);
    if (result.status !== -1) return result;
  }
  return result;
};

const disconnect = (address: string): Promise<void> =>
  new Promise((resolve, reject) => {
    BluetoothPrinter.disconnect(address).then(
      () => resolve(),
      (error: Error) => reject(error)
    );
  });

const EscNetPrinterEventEmitter =
  Platform.OS === "ios"
    ? new NativeEventEmitter(EscNetPrinterModule)
    : new NativeEventEmitter();

const TscUsbPrinterModule =
  Platform.OS === "ios"
    ? {
        connect: (..._args: unknown[]) =>
          rejectUnsupportedIOSUSB("TSC USB printing"),
        closeConnection: () => Promise.resolve(),
        printLabel: (..._args: unknown[]) =>
          rejectUnsupportedIOSUSB("TSC USB printing"),
      }
    : TscUsbPrinter;

TscBluetoothPrinter.DIRECTION = {
  FORWARD: 0,
  BACKWARD: 1,
};

TscBluetoothPrinter.DENSITY = {
  DNESITY0: 0,
  DNESITY1: 1,
  DNESITY2: 2,
  DNESITY3: 3,
  DNESITY4: 4,
  DNESITY5: 5,
  DNESITY6: 6,
  DNESITY7: 7,
  DNESITY8: 8,
  DNESITY9: 9,
  DNESITY10: 10,
  DNESITY11: 11,
  DNESITY12: 12,
  DNESITY13: 13,
  DNESITY14: 14,
  DNESITY15: 15,
};
TscBluetoothPrinter.BARCODETYPE = {
  CODE128: "128",
  CODE128M: "128M",
  EAN128: "EAN128",
  ITF25: "25",
  ITF25C: "25C",
  CODE39: "39",
  CODE39C: "39C",
  CODE39S: "39S",
  CODE93: "93",
  EAN13: "EAN13",
  EAN13_2: "EAN13+2",
  EAN13_5: "EAN13+5",
  EAN8: "EAN8",
  EAN8_2: "EAN8+2",
  EAN8_5: "EAN8+5",
  CODABAR: "CODA",
  POST: "POST",
  UPCA: "EAN13",
  UPCA_2: "EAN13+2",
  UPCA_5: "EAN13+5",
  UPCE: "EAN13",
  UPCE_2: "EAN13+2",
  UPCE_5: "EAN13+5",
  CPOST: "CPOST",
  MSI: "MSI",
  MSIC: "MSIC",
  PLESSEY: "PLESSEY",
  ITF14: "ITF14",
  EAN14: "EAN14",
};
TscBluetoothPrinter.FONTTYPE = {
  FONT_1: "1",
  FONT_2: "2",
  FONT_3: "3",
  FONT_4: "4",
  FONT_5: "5",
  FONT_6: "6",
  FONT_7: "7",
  FONT_8: "8",
  SIMPLIFIED_CHINESE: "TSS24.BF2",
  TRADITIONAL_CHINESE: "TST24.BF2",
  KOREAN: "K",
};
TscBluetoothPrinter.EEC = {
  LEVEL_L: "L",
  LEVEL_M: "M",
  LEVEL_Q: "Q",
  LEVEL_H: "H",
};
TscBluetoothPrinter.ROTATION = {
  ROTATION_0: 0,
  ROTATION_90: 90,
  ROTATION_180: 180,
  ROTATION_270: 270,
};
TscBluetoothPrinter.FONTMUL = {
  MUL_1: 1,
  MUL_2: 2,
  MUL_3: 3,
  MUL_4: 4,
  MUL_5: 5,
  MUL_6: 6,
  MUL_7: 7,
  MUL_8: 8,
  MUL_9: 9,
  MUL_10: 10,
};
TscBluetoothPrinter.BITMAP_MODE = {
  OVERWRITE: 0,
  OR: 1,
  XOR: 2,
};
TscBluetoothPrinter.PRINT_SPEED = {
  SPEED1DIV5: 1,
  SPEED2: 2,
  SPEED3: 3,
  SPEED4: 4,
};
TscBluetoothPrinter.TEAR = {
  ON: "ON",
  OFF: "OFF",
};
TscBluetoothPrinter.READABLE = {
  DISABLE: 0,
  EANBLE: 1,
};

EscBluetoothPrinter.ERROR_CORRECTION = {
  L: 1,
  M: 0,
  Q: 3,
  H: 2,
};

EscBluetoothPrinter.BARCODETYPE = {
  UPC_A: 65,
  UPC_E: 66,
  JAN13: 67,
  JAN8: 68,
  CODE39: 69,
  ITF: 70,
  CODABAR: 71,
  CODE93: 72,
  CODE128: 73,
};
EscBluetoothPrinter.ROTATION = {
  OFF: 0,
  ON: 1,
};
EscBluetoothPrinter.ALIGN = {
  LEFT: 0,
  CENTER: 1,
  RIGHT: 2,
};

EscBluetoothPrinter.connect = connect;
EscBluetoothPrinter.disconnect = disconnect;

export {
  COMMANDS,
  EscNetPrinter,
  EscUsbPrinter,
  EscNetPrinterEventEmitter,
  BluetoothPrinter,
  TscNetPrinter,
  TscUsbPrinterModule as TscUsbPrinter,
  EscBluetoothPrinter,
  TscBluetoothPrinter,
};

export enum RN_THERMAL_RECEIPT_PRINTER_EVENTS {
  EVENT_NET_PRINTER_SCANNED_SUCCESS = "scannerResolved",
  EVENT_NET_PRINTER_SCANNING = "scannerRunning",
  EVENT_NET_PRINTER_SCANNED_ERROR = "registerError",
}
