package com.xgitvn.printer;

import com.xgitvn.printer.bluetooth.BluetoothService;
import com.xgitvn.printer.bluetooth.RNBluetoothManagerModule;
import com.xgitvn.printer.bluetooth.escpos.RNBluetoothEscposPrinterModule;
import com.xgitvn.printer.bluetooth.tsc.RNBluetoothTscPrinterModule;
import com.xgitvn.printer.tsc.TscNetPrinterModule;
import com.xgitvn.printer.tsc.TscUsbPrinterModule;
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

public class RNPrinterPackage implements ReactPackage {
    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        BluetoothService bluetoothService = new BluetoothService(reactContext);
        return Arrays.asList(new NativeModule[]{
                new RNUSBPrinterModule(reactContext),
                new RNNetPrinterModule(reactContext),
                new RNBluetoothManagerModule(reactContext, bluetoothService),
                new RNBluetoothEscposPrinterModule(reactContext, bluetoothService),
                new RNBluetoothTscPrinterModule(reactContext, bluetoothService),
                new TscNetPrinterModule(reactContext),
                new TscUsbPrinterModule(reactContext),
        });
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
