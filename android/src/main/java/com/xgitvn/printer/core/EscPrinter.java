package com.xgitvn.printer.core;

import com.facebook.react.bridge.Callback;

public interface EscPrinter {
    void init(Callback successCallback, Callback errorCallback);

    void disconnect();

    void getDeviceList(Callback successCallback, Callback errorCallback);

    void printRawData(String base64Data, Callback errorCallback);

    void printImageData(String imageUrl, int imageWidth, int imageHeight, Callback errorCallback);

    void printImageBase64(String base64, int imageWidth, int imageHeight, Callback errorCallback);
}
