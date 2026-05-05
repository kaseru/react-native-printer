package com.xgitvn.printer.tsc;

import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.hardware.usb.UsbConstants;
import android.hardware.usb.UsbDevice;
import android.hardware.usb.UsbDeviceConnection;
import android.hardware.usb.UsbEndpoint;
import android.hardware.usb.UsbInterface;
import android.hardware.usb.UsbManager;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Iterator;

public class UsbPrinterModule extends ReactContextBaseJavaModule {
    private static final String ACTION_USB_PERMISSION = "com.xgitvn.printer.tsc.USB_PERMISSION";
    private final PendingIntent permissionIntent;

    private final UsbManager usbManager;
    private UsbDevice printerDevice;

    // BroadcastReceiver để xử lý kết quả cấp quyền USB
    private final BroadcastReceiver usbReceiver = new BroadcastReceiver() {
        public void onReceive(Context context, Intent intent) {
            String action = intent.getAction();
            if (ACTION_USB_PERMISSION.equals(action)) {
                synchronized (this) {
                    UsbDevice device = intent.getParcelableExtra(UsbManager.EXTRA_DEVICE);
                    if (intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false)) {
                        if (device != null) {
                            System.out.println("Permission granted for device ");
                        }
                    } else {
                        System.out.println("Permission denied for device ");
                    }
                }
            }
        }
    };

    public UsbPrinterModule(ReactApplicationContext reactContext) {
        super(reactContext);
        usbManager = (UsbManager) reactContext.getSystemService(Context.USB_SERVICE);
        permissionIntent = PendingIntent.getBroadcast(reactContext, 0, new Intent(ACTION_USB_PERMISSION), PendingIntent.FLAG_IMMUTABLE);
        IntentFilter filter = new IntentFilter(ACTION_USB_PERMISSION);
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
            // Dành cho Android 12 (API 31) trở lên
            getReactApplicationContext().registerReceiver(usbReceiver, filter, Context.RECEIVER_NOT_EXPORTED);
        } else {
            // Dành cho các phiên bản Android cũ hơn
            getReactApplicationContext().registerReceiver(usbReceiver, filter);
        }
    }

    @Override
    public String getName() {
        return "XUsbPrinterModule";
    }

    @ReactMethod
    public void connectToPrinter(int vendorId, int productId, Promise promise) {
        try {
            // Lấy danh sách thiết bị USB hiện có
            HashMap<String, UsbDevice> deviceList = usbManager.getDeviceList();
            Iterator<UsbDevice> deviceIterator = deviceList.values().iterator();

            while (deviceIterator.hasNext()) {
                UsbDevice device = deviceIterator.next();

                // Kiểm tra Vendor ID và Product ID
                if (device.getVendorId() == vendorId && device.getProductId() == productId) {
                    printerDevice = device;

                    // Kiểm tra quyền truy cập thiết bị USB
                    if (!usbManager.hasPermission(device)) {
                        usbManager.requestPermission(device, permissionIntent);
                        promise.reject("Error", "Requesting USB permission.");
                        return;
                    }

                    UsbDeviceConnection connection = usbManager.openDevice(printerDevice);
                    if (connection != null) {
                        promise.resolve("Printer connected successfully.");
                    } else {
                        promise.reject("Error", "Failed to open connection to USB device.");
                    }
                    return;
                }
            }

            promise.reject("Error", "Printer not found with specified Vendor ID and Product ID.");
        } catch (Exception e) {
            promise.reject("Error", "Exception occurred: " + e.getMessage());
        }
    }

    @ReactMethod
    public void printLabel(final ReadableMap options, final Promise promise) {
        try {
            byte[] dataToSend = PrintUtils.getPrinterData(options);

            // Gửi dữ liệu qua USB
            if (printerDevice == null) {
                promise.reject("Error", "Printer is not connected");
                return;
            }
            UsbDeviceConnection connection = usbManager.openDevice(printerDevice);
            if (connection == null) {
                promise.reject("Error", "Failed to open connection to USB device. Permission may be denied.");
                return;
            }

            UsbInterface usbInterface = printerDevice.getInterface(0);
            if (usbInterface == null) {
                promise.reject("Error", "No interface found on the USB device.");
                return;
            }

            UsbEndpoint endpoint = null;
            for (int i = 0; i < usbInterface.getEndpointCount(); i++) {
                UsbEndpoint ep = usbInterface.getEndpoint(i);
                if (ep.getDirection() == UsbConstants.USB_DIR_OUT) {
                    endpoint = ep;
                    break;
                }
            }
            if (endpoint == null) {
                promise.reject("Error", "No endpoint found on the USB interface.");
                return;
            }

            // Kiểm tra dữ liệu đã được gửi thành công
            int sentBytes = connection.bulkTransfer(endpoint, dataToSend, dataToSend.length, 5000);
            if (sentBytes > 0) {
                System.out.println("Data written successfully.");
                promise.resolve("Print success!!!");
            } else {
                promise.reject("Error", "Failed to write data to printer.");
            }

            connection.releaseInterface(usbInterface);
            connection.close();
        } catch (Exception e) {
            promise.reject("Send failed", e.getMessage());
        }
    }

    @ReactMethod
    public void getDevices(Promise promise) {
        try {
            UsbManager usbManager = (UsbManager) getReactApplicationContext().getSystemService(Context.USB_SERVICE);
            if (usbManager == null) {
                promise.reject("Error", "USB Manager is not available.");
                return;
            }
            HashMap<String, UsbDevice> deviceList = usbManager.getDeviceList();
            JSONArray devicesArray = new JSONArray();

            for (UsbDevice device : deviceList.values()) {
                JSONObject deviceInfo = new JSONObject();
                deviceInfo.put("deviceName", device.getDeviceName());
                deviceInfo.put("vendorId", device.getVendorId());
                deviceInfo.put("productId", device.getProductId());
                deviceInfo.put("manufacturerName", device.getManufacturerName());
                deviceInfo.put("productName", device.getProductName());
                devicesArray.put(deviceInfo);
            }
            promise.resolve(devicesArray.toString());
        } catch (Exception e) {
            promise.reject("Error", "Exception occurred: " + e.getMessage());
        }
    }
}
