package com.xgitvn.printer.esc.net.adapters;
import com.xgitvn.printer.esc.adapters.core.PrinterDevice;
import com.xgitvn.printer.esc.adapters.core.PrinterDeviceId;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

/**
 * Created by xiesubin on 2017/9/21.
 */

public class EscNetPrinterDevice implements PrinterDevice {
    private EscNetPrinterDeviceId mEscNetPrinterDeviceId;

    public EscNetPrinterDevice(String host, Integer port) {
        this.mEscNetPrinterDeviceId = EscNetPrinterDeviceId.valueOf(host, port);
    }

    @Override
    public PrinterDeviceId getPrinterDeviceId() {
        return this.mEscNetPrinterDeviceId;
    }

    @Override
    public WritableMap toRNWritableMap() {
        WritableMap deviceMap = Arguments.createMap();
        deviceMap.putString("device_name", this.mEscNetPrinterDeviceId.getHost() + ":" + this.mEscNetPrinterDeviceId.getPort());
        deviceMap.putString("host", this.mEscNetPrinterDeviceId.getHost());
        deviceMap.putInt("port", this.mEscNetPrinterDeviceId.getPort());
        return deviceMap;
    }
}
