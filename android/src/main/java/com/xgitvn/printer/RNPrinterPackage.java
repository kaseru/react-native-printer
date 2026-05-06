package com.xgitvn.printer;

import com.xgitvn.printer.bluetooth.BluetoothService;
import com.xgitvn.printer.bluetooth.RNBluetoothManager;
import com.xgitvn.printer.bluetooth.escpos.RNEscBluetoothPrinter;
import com.xgitvn.printer.bluetooth.tsc.RNTscBluetoothPrinter;
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

public class RNPrinterPackage implements ReactPackage {
    @Override
    public List<Native> createNativeModules(ReactApplicationContext reactContext) {
        BluetoothService bluetoothService = new BluetoothService(reactContext);
        return Arrays.asList(new Native[]{
                new EscUSBPrinter(reactContext),
                new EscPrinterNetwork(reactContext),
                new RNBluetoothManager(reactContext, bluetoothService),
                new RNEscBluetoothPrinter(reactContext, bluetoothService),
                new RNTscBluetoothPrinter(reactContext, bluetoothService),
                new TscNetPrinter(reactContext),
                new TscUsbPrinter(reactContext),
        });
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
