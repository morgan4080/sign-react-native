package com.presta.prestasign;

import static com.google.i18n.phonenumbers.NumberParseException.ErrorType.NOT_A_NUMBER;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.database.Cursor;
import android.net.Uri;
import android.os.Bundle;
import android.provider.ContactsContract;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.BaseActivityEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.android.gms.auth.api.identity.GetPhoneNumberHintIntentRequest;
import com.google.android.gms.auth.api.identity.Identity;
import com.google.android.gms.auth.api.phone.SmsRetriever;
import com.google.android.gms.auth.api.phone.SmsRetrieverClient;
import com.google.android.gms.common.api.CommonStatusCodes;
import com.google.android.gms.common.api.Status;
import com.google.android.gms.tasks.OnFailureListener;
import com.google.android.gms.tasks.OnSuccessListener;
import com.google.android.gms.tasks.Task;
import com.google.i18n.phonenumbers.NumberParseException;
import com.google.i18n.phonenumbers.PhoneNumberUtil;
import com.google.i18n.phonenumbers.Phonenumber.PhoneNumber;

import java.util.ArrayList;
import java.util.HashMap;
import com.google.gson.Gson;

public class SmsModule extends ReactContextBaseJavaModule {

    private final int phoneNumberRequestCode = 420;
    private final int contactRequestCode = 421;
    private int userConsentRequestCode = 69;
    private Promise promise;
    private static ReactApplicationContext reactContext;
    private PhoneNumberUtil phoneUtil = PhoneNumberUtil.getInstance();

    private final ActivityEventListener activityEventListener = new BaseActivityEventListener() {
        @Override
        public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
            handleOnActivityResult(activity, requestCode, resultCode, data);
        }
        @Override
        public void onNewIntent(Intent intent) {

        }
    };

    private final BroadcastReceiver smsVerificationReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if (SmsRetriever.SMS_RETRIEVED_ACTION.equals(intent.getAction())) {
                Bundle extras = intent.getExtras();
                Status smsRetrieverStatus = (Status) extras.get(SmsRetriever.EXTRA_STATUS);
                switch (smsRetrieverStatus.getStatusCode()) {
                    case CommonStatusCodes.SUCCESS:
                        try {
                            String message = (String) extras.get(SmsRetriever.EXTRA_SMS_MESSAGE);
                            if (message != null) {
                                SmsModule.sendEvent(Constant.SMS_RECEIVED, message);
                            } else {
                                Intent consentIntent = extras.getParcelable(SmsRetriever.EXTRA_CONSENT_INTENT);
                                getCurrentActivity().startActivityForResult(consentIntent, userConsentRequestCode);
                            }
                        } catch (ActivityNotFoundException e) {
                            e.printStackTrace();
                        }
                        break;
                    case CommonStatusCodes.TIMEOUT:
                        SmsModule.sendEvent(Constant.SMS_ERROR, CommonStatusCodes.TIMEOUT);
                        break;
                }
            }
        }
    };

    SmsModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
        context.addActivityEventListener(activityEventListener);
        IntentFilter intentFilter = new IntentFilter(SmsRetriever.SMS_RETRIEVED_ACTION);
        getReactApplicationContext().registerReceiver(smsVerificationReceiver, intentFilter, SmsRetriever.SEND_PERMISSION, null);
    }

    private void handleOnActivityResult (Activity activity, int requestCode, int resultCode, Intent data) {
        Gson gson = new Gson();

        if (requestCode == userConsentRequestCode) {
            if (resultCode == Activity.RESULT_OK) {
                String message = data.getStringExtra(SmsRetriever.EXTRA_SMS_MESSAGE);
                SmsModule.sendEvent(Constant.SMS_RECEIVED, message);
            } else {
                SmsModule.sendEvent(Constant.SMS_ERROR, "Unable to retrieve SMS");
            }
        }
        if (requestCode == phoneNumberRequestCode && promise != null) {
            if (resultCode == Activity.RESULT_OK) {
                try {
                    String phoneNumber = Identity.getSignInClient(activity).getPhoneNumberFromIntent(data);
                    String defaultCountry = "";
                    PhoneNumber number = phoneUtil.parseAndKeepRawInput(phoneNumber, defaultCountry);
                    String ph = Long.toString(number.getNationalNumber());
                    promise.resolve(ph);
                } catch (Exception e){
                    promise.reject("Phone Number Hint failed", e);
                }
            } else {
                promise.reject(String.valueOf(resultCode), "Unable to retrieve phone number");
            }
        }
        if (requestCode == contactRequestCode && promise != null) {
            if (resultCode == Activity.RESULT_OK) {
                Cursor cursor = null;

                try {
                    Uri contactUri = data.getData();

                    String[] projection = new String[]{ContactsContract.CommonDataKinds.Phone.NUMBER, ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME};

                    cursor = activity.getContentResolver()
                            .query(contactUri, projection, null, null, null);

                    int count = cursor.getColumnCount();

                    HashMap<String, String> column_index_column_name = new HashMap<String, String>();



                    for (int i = 0; i < count; i++) {
                        StringBuilder stringIndex = new StringBuilder("");
                        stringIndex.append(i);
                        column_index_column_name.put("column_index", stringIndex.toString());
                        column_index_column_name.put("column_name", cursor.getColumnName(i));
                    }

                    String number = "";

                    String name = "";

                    if (cursor.getCount() > 0) {
                        if (cursor.moveToFirst()) {
                            int column = cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.NUMBER);

                            number = cursor.getString(column);

                            int column0 = cursor.getColumnIndex(ContactsContract.CommonDataKinds.Phone.DISPLAY_NAME);

                            name = cursor.getString(column0);
                        }
                    }

                    String defaultCountry = "KE";

                    PhoneNumber phoneNumber = phoneUtil.parseAndKeepRawInput(number, defaultCountry);

                    boolean isValid = phoneUtil.isValidNumber(phoneNumber);

                    if (isValid) {
                        HashMap<String, String> country_code_phone_number = new HashMap<String, String>();
                        country_code_phone_number.put("name", name);
                        country_code_phone_number.put("country_code", Long.toString(phoneNumber.getCountryCode()));
                        country_code_phone_number.put("phone_no", Long.toString(phoneNumber.getNationalNumber()));
                        country_code_phone_number.put("column_index_column_name", gson.toJson(column_index_column_name));
                        String MapData = gson.toJson(country_code_phone_number);
                        promise.resolve(MapData);
                    } else {
                        throw new NumberParseException(NOT_A_NUMBER, "Contact Phone Number Get failed");
                    }
                } catch (NumberParseException e) {
                    promise.reject("Contact Phone Number Get failed", e);
                } finally {
                    if (cursor != null) {
                        cursor.close();
                    }
                }
            } else {
                promise.reject(String.valueOf(resultCode), "Unable to retrieve contact");
            }
        }
    }

    public static void sendEvent (String eventName, Object data) {
        if (reactContext == null) {
            return;
        }
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit(eventName, data);
    }

    @NonNull
    @Override
    public String getName() {
        return "AndroidSmsVerificationApi";
    }

    @ReactMethod
    public void multiply (int a, int b, Promise promise) {
        promise.resolve(a*b+5);
    }

    @ReactMethod
    public void getContact(int contactRequestCode, String alpha2Code, final Promise promise) {
        Activity currentActivity = getCurrentActivity();

        if (currentActivity == null) {
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist");
            return;
        }
        // Store the promise to resolve/reject when picker returns data
        this.promise = promise;

        try {
            Intent contacts = new Intent(Intent.ACTION_PICK);
            contacts.setDataAndType( ContactsContract.Contacts.CONTENT_URI, ContactsContract.CommonDataKinds.Phone.CONTENT_TYPE);
            contacts.putExtra("alpha2Code", alpha2Code);
            currentActivity.startActivityForResult(contacts, contactRequestCode);
        } catch (Exception e) {
            this.promise.reject("E_FAILED_TO_SHOW_PICKER", e);
            this.promise = null;
        }
    }

    @ReactMethod
    public void requestPhoneNumberFormat(String alpha2Code, String phone_number, final Promise promise) {
        // TODO: receive country identifier and return promise with string format example
        try {
            PhoneNumber phoneNumber = phoneUtil.parseAndKeepRawInput(phone_number, alpha2Code);

            boolean isValid = phoneUtil.isValidNumber(phoneNumber);

            if (isValid) {
                HashMap<String, String> country_code_phone_number = new HashMap<String, String>();
                country_code_phone_number.put("country_code", Long.toString(phoneNumber.getCountryCode()));
                country_code_phone_number.put("phone_no", Long.toString(phoneNumber.getNationalNumber()));
                Gson gson = new Gson();
                String MapData = gson.toJson(country_code_phone_number);
                promise.resolve(MapData);
            } else {
                throw new NumberParseException(NOT_A_NUMBER, "Contact Phone Number Get failed");
            }
        } catch (NumberParseException e) {
            promise.reject("Number parse error", e);
        }
    }

    @ReactMethod
    public void requestPhoneNumber(int phoneNumberRequestCode, final Promise promise) {
        Activity currentActivity = getCurrentActivity();

        if (currentActivity == null) {
            promise.reject("E_ACTIVITY_DOES_NOT_EXIST", "Activity doesn't exist");
            return;
        }

        // Store the promise to resolve/reject when picker returns data
        this.promise = promise;

        try {
            GetPhoneNumberHintIntentRequest request = GetPhoneNumberHintIntentRequest.builder().build();

            Identity.getSignInClient(currentActivity)
                    .getPhoneNumberHintIntent(request)
                    .addOnSuccessListener( result -> {
                        try {
                            currentActivity.startIntentSenderForResult(result.getIntentSender(), phoneNumberRequestCode, null, 0, 0, 0);
                        } catch(Exception e) {
                            this.promise.reject("Launching the PendingIntent failed", e);
                        }
                    })
                    .addOnFailureListener(e -> {
                        this.promise.reject("Phone Number Hint failed", e);
                    });

        } catch (Exception e) {
            this.promise.reject("E_FAILED_TO_SHOW_PICKER", e);
            this.promise = null;
        }

    };

    // remove after getting app signature

    @ReactMethod
    public void getAppSignatures (Promise promise) {
        AppSignatureHelper helper = new AppSignatureHelper(getReactApplicationContext());
        WritableNativeArray array = new WritableNativeArray();
        ArrayList<String> signatures = helper.getAppSignatures();
        for (String signature : signatures) {
            array.pushString(signature);
        }
        promise.resolve(array);
    }

    @ReactMethod
    public void startSmsRetriever (Promise promise) {
        SmsRetrieverClient client = SmsRetriever.getClient(getReactApplicationContext());
        Task<Void> task = client.startSmsRetriever();
        task.addOnSuccessListener(new OnSuccessListener<Void>() {
            @Override
            public void onSuccess(Void aVoid) {
                promise.resolve(true);
            }
        });
        task.addOnFailureListener(new OnFailureListener() {
            @Override
            public void onFailure(@NonNull Exception e) {
                promise.reject(e);
            }
        });
    }

    @ReactMethod
    public void startSmsUserConsent (String senderPhoneNumber, int userConsentRequestCode, Promise promise) {
        this.userConsentRequestCode = userConsentRequestCode;
        SmsRetrieverClient client = SmsRetriever.getClient(getReactApplicationContext());
        Task<Void> task;
        if (senderPhoneNumber == null) {
            task = client.startSmsUserConsent(null);
        } else {
            task = client.startSmsUserConsent(senderPhoneNumber);
        }
        task.addOnSuccessListener(new OnSuccessListener<Void>() {
            @Override
            public void onSuccess(Void aVoid) {
                promise.resolve(true);
            }
        });
        task.addOnFailureListener(new OnFailureListener() {
            @Override
            public void onFailure(@NonNull Exception e) {
                promise.reject(e);
            }
        });
    }

}