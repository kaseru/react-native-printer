package com.xgitvn.printer.esc.usb.adapters;
import com.xgitvn.printer.esc.adapters.core.PrinterDevice;
import com.xgitvn.printer.esc.adapters.core.PrinterDeviceId;

import android.hardware.usb.UsbDevice;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

/**
 * Created by xiesubin on 2017/9/21.
 */

public class EscUSBPrinterDevice implements PrinterDevice{
    private UsbDevice mDevice;
    private EscUSBPrinterDeviceId usbPrinterDeviceId;

    public EscUSBPrinterDevice(UsbDevice device) {
        this.usbPrinterDeviceId = EscUSBPrinterDeviceId.valueOf(device.getVendorId(), device.getProductId());
        this.mDevice = device;
    }


    @Override
    public PrinterDeviceId getPrinterDeviceId() {
        return this.usbPrinterDeviceId;
    }

    public UsbDevice getUsbDevice() {
        return this.mDevice;
    }

    @Override
    public WritableMap toRNWritableMap() {
        WritableMap deviceMap = Arguments.createMap();
        deviceMap.putString("device_name", this.mDevice.getDeviceName());
        deviceMap.putInt("device_id", this.mDevice.getDeviceId());
        deviceMap.putInt("vendor_id", this.mDevice.getVendorId());
        deviceMap.putInt("product_id", this.mDevice.getProductId());
        return deviceMap;
    }

}
