package com.xgitvn.printer.adapter;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

/**
 * Created by xiesubin on 2017/9/21.
 */

public class NetEscPrinterDevice implements PrinterDevice {
    private NetEscPrinterDeviceId mNetEscPrinterDeviceId;

    public NetEscPrinterDevice(String host, Integer port) {
        this.mNetEscPrinterDeviceId = NetEscPrinterDeviceId.valueOf(host, port);
    }

    @Override
    public PrinterDeviceId getPrinterDeviceId() {
        return this.mNetEscPrinterDeviceId;
    }

    @Override
    public WritableMap toRNWritableMap() {
        WritableMap deviceMap = Arguments.createMap();
        deviceMap.putString("device_name", this.mNetEscPrinterDeviceId.getHost() + ":" + this.mNetEscPrinterDeviceId.getPort());
        deviceMap.putString("host", this.mNetEscPrinterDeviceId.getHost());
        deviceMap.putInt("port", this.mNetEscPrinterDeviceId.getPort());
        return deviceMap;
    }
}
