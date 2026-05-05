
package com.xgitvn.printer.tsc;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import java.util.Collections;
import java.util.List;
import com.facebook.react.uimanager.ViewManager;

public class UsbPrinterModulePackage implements ReactPackage {

    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        return Collections.singletonList(new UsbPrinterModule(reactContext));
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
