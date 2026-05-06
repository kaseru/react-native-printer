package com.xgitvn.printer.esc.usb;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.xgitvn.printer.adapters.core.PrinterAdapter;
import com.xgitvn.printer.adapters.core.PrinterDevice;
import com.xgitvn.printer.esc.adapters.usb.EscUSBPrinterAdapter;
import com.xgitvn.printer.esc.adapters.usb.EscUSBPrinterDeviceId;

import java.util.List;

/**
 * Created by xiesubin on 2017/9/22.
 */

public class EscUSBPrinter extends ReactContextBaseJavaModule implements EscPrinter {

    protected ReactApplicationContext reactContext;

    protected PrinterAdapter adapter;

    public EscUSBPrinter(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @ReactMethod
    @Override
    public void init(Callback successCallback, Callback errorCallback) {
        this.adapter = EscUSBPrinterAdapter.getInstance();
        this.adapter.init(reactContext,  successCallback, errorCallback);
    }

    @ReactMethod
    @Override
    public void closeConn()  {
        if (this.adapter == null) {
            this.adapter = EscUSBPrinterAdapter.getInstance();
        }
        this.adapter.closeConnectionIfExists();
    }

    @ReactMethod
    @Override
    public void getDeviceList(Callback successCallback, Callback errorCallback)  {
        List<PrinterDevice> printerDevices = adapter.getDeviceList(errorCallback);
        WritableArray pairedDeviceList = Arguments.createArray();
        if(printerDevices.size() > 0) {
            for (PrinterDevice printerDevice : printerDevices) {
                pairedDeviceList.pushMap(printerDevice.toRNWritableMap());
            }
            successCallback.invoke(pairedDeviceList);
        }else{
            errorCallback.invoke("No Device Found");
        }
    }

    @ReactMethod
    @Override
    public void printRawData(String base64Data, Callback errorCallback){
        adapter.printRawData(base64Data, errorCallback);
    }

    @ReactMethod
    @Override
    public void printImageData(String imageUrl, int imageWidth, int imageHeight, Callback errorCallback) {
        adapter.printImageData(imageUrl, imageWidth, imageHeight,errorCallback);
    }

    @ReactMethod
    @Override
    public void printImageBase64(String base64, int imageWidth, int imageHeight, Callback errorCallback) {
        // String imageBase64 = "data:image/png;base64," + imageUrl;
        // String base64ImageProcessed = imageUrl.split(",")[1];
        byte[] decodedString = Base64.decode(base64, Base64.DEFAULT);
        Bitmap decodedByte = BitmapFactory.decodeByteArray(decodedString, 0, decodedString.length);
        adapter.printImageBase64(decodedByte, imageWidth, imageHeight,errorCallback);
    }

    @ReactMethod
    public void connectPrinter(Integer vendorId, Integer productId, Callback successCallback, Callback errorCallback) {
        adapter.selectDevice(EscUSBPrinterDeviceId.valueOf(vendorId, productId), successCallback, errorCallback);
    }

    @Override
    public String getName() {
        return "EscUsbPrinter";
    }
}
