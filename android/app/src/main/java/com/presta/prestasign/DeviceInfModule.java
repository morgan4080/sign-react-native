package com.presta.prestasign;

import static android.provider.Settings.Secure.getString;

import android.annotation.SuppressLint;
import android.provider.Settings;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.io.IOException;

public class DeviceInfModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    DeviceInfModule(ReactApplicationContext context) {
        super(context);

        reactContext = context;
    }

    @SuppressLint("HardwareIds")
    @ReactMethod(isBlockingSynchronousMethod = true)
    public String getUniqueIdSync() {
        return getString(reactContext.getContentResolver(), Settings.Secure.ANDROID_ID);
    }

    @ReactMethod
    public void getUniqueId(Promise p) {
        p.resolve(getUniqueIdSync());
    }

    @NonNull
    @Override
    public String getName() {
        return "DeviceInfModule";
    }
}
