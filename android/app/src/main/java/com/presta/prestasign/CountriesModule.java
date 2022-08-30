package com.presta.prestasign;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import java.io.IOException;
import java.io.InputStream;

public class CountriesModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    CountriesModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @ReactMethod
    public void getCountries(Promise promise) {
        String jsonString;
        try {
            InputStream res = reactContext.getResources().openRawResource(R.raw.countries);
            int size = res.available();
            byte[] buffer = new byte[size];
            res.read(buffer);
            res.close();
            jsonString = new String(buffer, "UTF-8");
            promise.resolve(jsonString);
        } catch (IOException e) {
            e.printStackTrace();
            promise.reject("Create Event Error", e);
        }
    }

    @NonNull
    @Override
    public String getName() {
        return "CountriesModule";
    }
}