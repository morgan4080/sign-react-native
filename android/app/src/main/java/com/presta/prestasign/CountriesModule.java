package com.presta.prestasign;

import android.os.Build;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Objects;

public class CountriesModule extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    CountriesModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @ReactMethod
    public void getCountry(String code, Promise promise) {
        String jsonString;

        try {
            InputStream res = reactContext.getResources().openRawResource(R.raw.countries);
            int size = res.available();

            byte[] buffer = new byte[size];

            res.read(buffer);

            res.close();

            jsonString = new String(buffer, StandardCharsets.UTF_8);

            JSONArray countriesArray = new JSONArray(jsonString);

            JSONObject country = null;

            for (int i=0 ; i<countriesArray.length() ; i++){
                JSONObject object = countriesArray.getJSONObject(i);
                String countryCode = (String) object.get("code");
                if (Objects.isNull(countryCode)) continue;
                if (countryCode.equalsIgnoreCase(code)) {
                    country = object;
                    break;
                }
            }

            if (Objects.nonNull(country)) {
                assert country != null;
                promise.resolve(country.toString());
            }

        } catch (Exception e) {
            e.printStackTrace();
            promise.reject("Create Event Error", e);
        }
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
            jsonString = new String(buffer, StandardCharsets.UTF_8);
            promise.resolve(jsonString);
        } catch (Exception e) {
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