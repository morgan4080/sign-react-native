package com.presta.prestasign

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.i18n.phonenumbers.PhoneNumberUtil
import com.google.i18n.phonenumbers.Phonenumber

class PhoneNumberModule(val reactContext: ReactApplicationContext): ReactContextBaseJavaModule(reactContext) {
    val phoneUtils = PhoneNumberUtil.getInstance()

    @ReactMethod
    fun isValidPhoneNumberForRegion(phoneNumber: Phonenumber.PhoneNumber, regionCode: String): Boolean {
        return phoneUtils.isValidNumberForRegion(phoneNumber, regionCode)
    }

    override fun getName(): String {
        return "PhoneNumber"
    }
}