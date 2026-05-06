package com.xgitvn.printer.core;

import com.xgitvn.printer.bluetooth.BluetoothService;
import com.xgitvn.printer.bluetooth.BluetoothManager;
import com.xgitvn.printer.bluetooth.escpos.EscBluetoothPrinter;
import com.xgitvn.printer.bluetooth.tsc.TscBluetoothPrinter;
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
                new BluetoothManager(reactContext, bluetoothService),
                new EscBluetoothPrinter(reactContext, bluetoothService),
                new TscBluetoothPrinter(reactContext, bluetoothService),
                new TscNetPrinter(reactContext),
                new TscUsbPrinter(reactContext),
        });
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
