package com.presta.prestasign;

import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.app.Activity

public class GooglePlayModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var snackbar: Snackbar? = null
    @ReactMethod
    fun startInAppUpdate (requestCode: Int) {
        val appUpdateManager = AppUpdateManagerFactory.create(context)

        // Returns an intent object that you use to check for an update.
        val appUpdateInfoTask = appUpdateManager.appUpdateInfo

        // Checks that the platform will allow the specified type of update.
        appUpdateInfoTask.addOnSuccessListener { appUpdateInfo ->
            if (appUpdateInfo.updateAvailability() == UpdateAvailability.UPDATE_AVAILABLE
                    // This example applies an immediate update. To apply a flexible update
                    // instead, pass in AppUpdateType.FLEXIBLE
                    && appUpdateInfo.isUpdateTypeAllowed(AppUpdateType.IMMEDIATE)
            ) {
              /*
                The returned AppUpdateInfo instance contains the update availability status.
                 Depending on the status of the update, the instance also contains:
                  - If an update is available and the update is allowed, the instance also contains an intent to start the update.
                  - If an in-app update is already in progress, the instance also reports the status of the in-progress update.
              */

                // Request the update.

                startAppUpdateImmediate(appUpdateInfo)

            }

            // if update in progress and triggered
            if (appUpdateInfo.updateAvailability() == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS) {
                if (appUpdateInfo.installStatus() == InstallStatus.DOWNLOADED) {
                    popupSnackbarForUserConfirmation("Update Already Downloaded");
                } else {
                    popupSnackbarForUserConfirmation("Update In Progress");
                }
            }
        }
    }

    fun startAppUpdateImmediate(appUpdateInfo: AppUpdateInfo) {
        try {
            val currentActivity: Activity = getCurrentActivity()

            appUpdateManager.startUpdateFlowForResult(
                    // Pass the intent that is returned by 'getAppUpdateInfo()'.
                    appUpdateInfo,
                    // Or 'AppUpdateType.FLEXIBLE' for flexible updates.
                    AppUpdateType.IMMEDIATE,
                    // The current activity making the update request.
                    currentActivity,
                    // Include a request code to later monitor this update request.
                    requestCode)
        } catch (e: IntentSender.SendIntentException) {

        }
    }

    fun popupSnackbarForUserConfirmation(message: String) {
        if (snackbar != null && snackbar.isShownOrQueued()) {
            snackbar.dismiss();
        }
        val currentActivity: Activity = getCurrentActivity()
        snackbar = Snackbar.make(currentActivity,
                message,
                Snackbar.LENGTH_INDEFINITE)
        snackbar.show()
    }


    override fun getName(): String {
        return "GooglePlay"
    }
}