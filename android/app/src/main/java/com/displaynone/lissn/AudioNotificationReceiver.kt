// AudioNotificationReceiver.kt
package com.displaynone.lissn

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.Toast
import com.facebook.react.ReactApplication
import com.facebook.react.modules.core.DeviceEventManagerModule

class AudioNotificationReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        val action = intent?.action ?: return

        val app = context.applicationContext as ReactApplication
        val reactCtx = app.reactNativeHost.reactInstanceManager.currentReactContext

        if (reactCtx == null) {
            val launch = context.packageManager
                .getLaunchIntentForPackage(context.packageName)
                ?.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP)
            if (launch != null) context.startActivity(launch)
            return
        }

        val emitter = reactCtx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
        when (action) {
            AudioNotificationService.ACTION_PLAY_PAUSE -> {
                emitter.emit("audio-notif-play-pause", null)
            }
            AudioNotificationService.ACTION_NEXT -> {
                emitter.emit("audio-notif-next", null)
            }
            AudioNotificationService.ACTION_PREV -> {
                emitter.emit("audio-notif-prev", null)
            }
            AudioNotificationService.ACTION_STOP -> {
                emitter.emit("audio-notif-stop", null)
            }
            else -> Log.d("LissnNotif", "Unknown action: $action")
        }
    }
}
