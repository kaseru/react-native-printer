package com.xgitvn.printer;

import com.xgitvn.printer.bluetooth.BluetoothService;
import com.xgitvn.printer.bluetooth.BluetoothManagerModule;
import com.xgitvn.printer.bluetooth.escpos.EscBluetoothPrinterModule;
import com.xgitvn.printer.bluetooth.tsc.TscBluetoothPrinterModule;
import com.xgitvn.printer.tsc.TscNetPrinter;
import com.xgitvn.printer.tsc.TscUsbPrinter;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.Native;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

/**
 * Created by xiesubin on 2017/9/21.
 */

public class PrinterPackage implements ReactPackage {
    @Override
    public List<Native> createNativeModules(ReactApplicationContext reactContext) {
        BluetoothService bluetoothService = new BluetoothService(reactContext);
        return Arrays.asList(new Native[]{
                new EscUSBPrinter(reactContext),
                new EscPrinterNetwork(reactContext),
                new BluetoothManagerModule(reactContext, bluetoothService),
                new EscBluetoothPrinterModule(reactContext, bluetoothService),
                new TscBluetoothPrinterModule(reactContext, bluetoothService),
                new TscNetPrinter(reactContext),
                new TscUsbPrinter(reactContext),
        });
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
