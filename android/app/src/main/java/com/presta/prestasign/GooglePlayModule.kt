package com.presta.prestasign

import android.content.IntentSender
import android.graphics.Color
import android.view.View
import android.view.ViewGroup
import com.facebook.react.bridge.Callback
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
                popSnackBarForUserConfirmation("Starting Update", null, null, null)
                startAppUpdateImmediate(appUpdateInfo, requestCode)

            }

            // if update in progress and triggered
            if (appUpdateInfo.updateAvailability() == UpdateAvailability.DEVELOPER_TRIGGERED_UPDATE_IN_PROGRESS) {
                if (appUpdateInfo.installStatus() == InstallStatus.DOWNLOADED) {
                    popSnackBarForUserConfirmation("Update Already Downloaded", "SUCCESS", null, null)
                } else {
                    popSnackBarForUserConfirmation("Update In Progress", "SUCCESS", null, null)
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

    @ReactMethod
    private fun popSnackBarForUserConfirmation(
        message: String,
        status: String?,
        actionText: String?,
        callback: Callback?
    ) {
        val activity = currentActivity

        if (activity != null) {
            val view: ViewGroup = activity.window.decorView.findViewById(android.R.id.content)

            if (snackbar != null && snackbar!!.isShownOrQueued) {
                snackbar!!.dismiss()
            }

            snackbar = Snackbar.make(
                view,
                message,
                Snackbar.LENGTH_LONG
            )

            if (actionText != null && callback != null) {
                snackbar?.setActionTextColor(Color.parseColor("#FFFFFF"))
                snackbar!!.setAction(actionText, View.OnClickListener {
                    callback.invoke()
                })
            }

            snackbar?.setTextColor(Color.parseColor("#FFFFFF"))

            when (status) {
                "SUCCESS" -> snackbar?.view?.setBackgroundColor(Color.parseColor("#80BFAD"))
                "WARNING" -> snackbar?.view?.setBackgroundColor(Color.parseColor("#F29979"))
                "ERROR" -> snackbar?.view?.setBackgroundColor(Color.parseColor("#D95F5F"))
                else -> snackbar?.view?.setBackgroundColor(Color.parseColor("#3D889A"))
            }

            snackbar?.show()
        }
    }

    override fun getName(): String {
        return "GooglePlayApis"
    }
}