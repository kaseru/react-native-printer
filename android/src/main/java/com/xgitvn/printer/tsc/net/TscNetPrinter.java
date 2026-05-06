package com.xgitvn.printer.tsc.net;
import com.xgitvn.printer.tsc.PrintUtils;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import java.io.OutputStream;
import java.io.PrintWriter;
import java.net.Socket;
import java.net.InetSocketAddress;

public class TscNetPrinter extends ReactContextBaseJavaModule {
    private Socket socket;
    private OutputStream outputStream;

    public TscNetPrinter(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "TscNetPrinter";
    }

    @ReactMethod
    public void ping(String host, int timeoutMs, Promise promise) {
        new Thread(() -> {
        try (Socket socket = new Socket()) {
            socket.connect(new InetSocketAddress(host, 9100), timeoutMs);
            promise.resolve(true);
        } catch (Exception e) {
            promise.resolve(false);
        }
        }).start();
    }

    @ReactMethod
    public void connect(String host, int port, Promise promise) {
        try {
            socket = new Socket(host, port);
            outputStream = socket.getOutputStream();
            promise.resolve("Connected to printer successfully");
        } catch (Exception e) {
            promise.reject("Connection failed", e.getMessage());
        }
    }

    @ReactMethod
    public void printLabel(final ReadableMap options, final Promise promise) {
        try {
            byte[] dataToSend = PrintUtils.getPrinterData(options);
            if (socket != null && outputStream != null) {
                // Mã hóa dữ liệu thành chuỗi Base64
                outputStream.write(dataToSend);
                outputStream.flush();
                System.out.println("Data written successfully.");
                promise.resolve("Print success!!!");
            } else {
                promise.reject("Error", "Socket is not connected");
            }
        } catch (Exception e) {
            promise.reject("Send failed", e.getMessage());
        }
    }

    @ReactMethod
    public void sendDataToPrinter(String data, Promise promise) {
        try {
            if (socket != null && outputStream != null) {
                PrintWriter writer = new PrintWriter(outputStream, true);
                writer.print(data);
                writer.flush();
                promise.resolve("Data sent successfully");
            } else {
                promise.reject("Error", "Socket is not connected");
            }
        } catch (Exception e) {
            promise.reject("Send failed", e.getMessage());
        }
    }

    @ReactMethod
    public void closeConnection(Promise promise) {
        try {
            if (outputStream != null) {
                outputStream.close();
            }
            if (socket != null) {
                socket.close();
            }
            promise.resolve("Connection closed successfully");
        } catch (Exception e) {
            promise.reject("Close failed", e.getMessage());
        }
    }
}
