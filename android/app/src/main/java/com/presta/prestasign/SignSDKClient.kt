package com.presta.prestasign

import android.app.Application;
import android.graphics.Bitmap;
import com.zoho.sign.sdk.SignSDK;
import com.zoho.sign.sdk.interfaces.SignSDKAccessTokenCallback;
import com.zoho.sign.sdk.interfaces.SignSDKClientCallback;

class SignSDKClient: Application() {

    override fun onCreate() {

        super.onCreate()

        initSignSDK()

    }

    private fun initSignSDK() {

        val signSDK = SignSDK.getInstance(applicationContext)

        signSDK.initialize(scopeName = "SignSDK.Default", object: SignSDKClientCallback {
            //default scopeName = "SignSDK.Default"

            override fun requireAuthToken(accessTokenCallback: SignSDKAccessTokenCallback) {

                val authToken = TODO("Implement your business logic to get your authToken")

//                signSDK.setAuthToken(authToken)

            }


            override fun setNonFatalException(throwable: Throwable, message: String?) {

                TODO("Not yet implemented")

            }

            override fun forceLogout(errorMessage: String, errorCode: Int) {

                TODO("Not yet implemented")

            }

            override fun requireUserProfileImage(): Bitmap {

                TODO("Not yet implemented")

            }

        })

    }


}