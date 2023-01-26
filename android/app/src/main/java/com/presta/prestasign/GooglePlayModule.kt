package com.presta.prestasign

import android.content.IntentSender
import android.view.ViewGroup
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.google.android.material.snackbar.Snackbar
import com.google.android.play.core.appupdate.AppUpdateInfo
import com.google.android.play.core.appupdate.AppUpdateManager
import com.google.android.play.core.appupdate.AppUpdateManagerFactory
import com.google.android.play.core.install.model.AppUpdateType
import com.google.android.play.core.install.model.InstallStatus
import com.google.android.play.core.install.model.UpdateAvailability


class GooglePlayModule(val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    private var snackbar: Snackbar? = null
    @ReactMethod
    fun startInAppUpdate (requestCode: Int) {
        val appUpdateManager: AppUpdateManager = AppUpdateManagerFactory.create(reactContext)

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

                startAppUpdateImmediate(appUpdateInfo, requestCode)

            }

            val activity = currentActivity

            if (activity != null) {
                val view: ViewGroup = activity.window.decorView.findViewById(android.R.id.content)

                // if update in progress and triggered
                if (appUpdateInfo.updateAvailability() == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS) {
                    if (appUpdateInfo.installStatus() == InstallStatus.DOWNLOADED) {
                        popSnackBarForUserConfirmation("Update Already Downloaded", view)
                    } else {
                        popSnackBarForUserConfirmation("Update In Progress", view)
                    }
                }
            }
        }
    }

    private fun startAppUpdateImmediate(appUpdateInfo: AppUpdateInfo, requestCode: Int) {
        try {
            val appUpdateManager: AppUpdateManager = AppUpdateManagerFactory.create(reactContext)
            val activity = currentActivity
            if (currentActivity != null) {
                if (activity != null) {
                    appUpdateManager.startUpdateFlowForResult(
                        // Pass the intent that is returned by 'getAppUpdateInfo()'.
                        appUpdateInfo,
                        // Or 'AppUpdateType.FLEXIBLE' for flexible updates.
                        AppUpdateType.IMMEDIATE,
                        // The current activity making the update request.
                        activity,
                        // Include a request code to later monitor this update request.
                        requestCode)
                }
            }
        } catch (e: IntentSender.SendIntentException) {
            e.printStackTrace()
        }
    }

    private fun popSnackBarForUserConfirmation(message: String, view: ViewGroup) {
        if (snackbar != null && snackbar!!.isShownOrQueued) {
            snackbar!!.dismiss()
        }

        snackbar = Snackbar.make(
            view,
            message,
            Snackbar.LENGTH_INDEFINITE
        )
        snackbar?.show()
    }

    override fun getName(): String {
        return "GooglePlay"
    }
}