package com.xgitvn.printer.core;
import com.xgitvn.printer.esc.usb.EscUSBPrinter;
import com.xgitvn.printer.esc.net.EscPrinterNetwork;

import com.xgitvn.printer.core.BluetoothService;
import com.xgitvn.printer.core.BluetoothManager;
import com.xgitvn.printer.esc.bluetooth.EscBluetoothPrinter;
import com.xgitvn.printer.tsc.bluetooth.TscBluetoothPrinter;
import com.xgitvn.printer.tsc.net.TscNetPrinter;
import com.xgitvn.printer.tsc.usb.TscUsbPrinter;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
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
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        BluetoothService bluetoothService = new BluetoothService(reactContext);
        return Arrays.asList(new NativeModule[]{
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
