package com.displaynone.lissn

import android.app.ForegroundServiceStartNotAllowedException
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.util.Log
import androidx.core.content.ContextCompat
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class AudioNotificationModule(private val reactCtx: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactCtx) {

    override fun getName() = "AudioNotificationModule"

    private var actionReceiver: BroadcastReceiver? = null

    private fun dispatchToService(intent: Intent, forceForegroundStart: Boolean) {
        val serviceRunning = AudioNotificationService.isRunning()
        val needsForegroundStart = forceForegroundStart || !serviceRunning

        try {
            if (needsForegroundStart && Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                if (canStartForegroundService()) {
                    ContextCompat.startForegroundService(reactCtx, intent)
                } else {
                    Log.w(
                        "LissnNotif",
                        "Skipping startForegroundService because the app is backgrounded"
                    )
                }
            } else {
                reactCtx.startService(intent)
            }
        } catch (e: ForegroundServiceStartNotAllowedException) {
            Log.w("LissnNotif", "System blocked startForegroundService", e)
        } catch (e: IllegalStateException) {
            Log.w("LissnNotif", "System blocked startService", e)
        }
    }

    @ReactMethod
    fun startService(title: String, artist: String, smallIconName: String?, largeIconPath: String?, isPlaying: Boolean) {
        val intent = Intent(reactCtx, AudioNotificationService::class.java).apply {
            putExtra(AudioNotificationService.EXTRA_TITLE, title)
            putExtra(AudioNotificationService.EXTRA_ARTIST, artist)
            putExtra(AudioNotificationService.EXTRA_SMALL_ICON_NAME, smallIconName)
            putExtra(AudioNotificationService.EXTRA_LARGE_ICON_PATH, largeIconPath)
            putExtra(AudioNotificationService.EXTRA_IS_PLAYING, isPlaying)
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        dispatchToService(intent, forceForegroundStart = true)
    }

    @ReactMethod
    fun update(title: String?, artist: String?, smallIconName: String?, largeIconPath: String?, isPlaying: Boolean?) {
        val intent = Intent(reactCtx, AudioNotificationService::class.java).apply {
            title?.let { putExtra(AudioNotificationService.EXTRA_TITLE, it) }
            artist?.let { putExtra(AudioNotificationService.EXTRA_ARTIST, it) }
            smallIconName?.let { putExtra(AudioNotificationService.EXTRA_SMALL_ICON_NAME, it) }
            largeIconPath?.let { putExtra(AudioNotificationService.EXTRA_LARGE_ICON_PATH, it) }
            isPlaying?.let { putExtra(AudioNotificationService.EXTRA_IS_PLAYING, it) }
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        dispatchToService(intent, forceForegroundStart = false)
    }

    @ReactMethod
    fun updateProgress(currentTime: Double, duration: Double) {
        val intent = Intent(reactCtx, AudioNotificationService::class.java).apply {
            putExtra(AudioNotificationService.EXTRA_CURRENT_TIME, currentTime.toLong())
            putExtra(AudioNotificationService.EXTRA_DURATION, duration.toLong())
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        dispatchToService(intent, forceForegroundStart = false)
    }

    @ReactMethod
    fun updateWithProgress(
        title: String?,
        artist: String?,
        smallIconName: String?,
        largeIconPath: String?,
        isPlaying: Boolean?,
        currentTime: Double?,
        duration: Double?
    ) {
        val intent = Intent(reactCtx, AudioNotificationService::class.java).apply {
            title?.let { putExtra(AudioNotificationService.EXTRA_TITLE, it) }
            artist?.let { putExtra(AudioNotificationService.EXTRA_ARTIST, it) }
            smallIconName?.let { putExtra(AudioNotificationService.EXTRA_SMALL_ICON_NAME, it) }
            largeIconPath?.let { putExtra(AudioNotificationService.EXTRA_LARGE_ICON_PATH, it) }
            isPlaying?.let { putExtra(AudioNotificationService.EXTRA_IS_PLAYING, it) }
            currentTime?.let { putExtra(AudioNotificationService.EXTRA_CURRENT_TIME, it.toLong()) }
            duration?.let { putExtra(AudioNotificationService.EXTRA_DURATION, it.toLong()) }
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        dispatchToService(intent, forceForegroundStart = false)
    }

    @ReactMethod
    fun stop() {
        reactCtx.stopService(Intent(reactCtx, AudioNotificationService::class.java))
    }

    @ReactMethod
    fun notifyReactNativeReady() {
        registerActionReceiver()
        val intent = Intent(reactCtx, AudioNotificationService::class.java).apply {
            action = "REACT_NATIVE_READY"
        }
        reactCtx.startService(intent)
    }

    private fun registerActionReceiver() {
        if (actionReceiver != null) {
            return
        }

        val filter = IntentFilter().apply {
            addAction("audio-notif-action")
        }

        actionReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                val action = intent?.getStringExtra("action") ?: return

                try {
                    val emitter = reactCtx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    if (action == "audio-notif-seek-to") {
                        val seekPosition = intent.getDoubleExtra("seekPosition", 0.0)
                        val params = Arguments.createMap().apply {
                            putDouble("position", seekPosition)
                        }
                        emitter.emit(action, params)
                    } else {
                        emitter.emit(action, null)
                    }
                } catch (e: Exception) {
                    Log.e("LissnNotif", "AudioNotificationModule error emitting $action", e)
                }
            }
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            reactCtx.registerReceiver(actionReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            reactCtx.registerReceiver(actionReceiver, filter)
        }
    }

    private fun unregisterActionReceiver() {
        actionReceiver?.let {
            try {
                reactCtx.unregisterReceiver(it)
                actionReceiver = null
            } catch (e: Exception) {
                Log.e("LissnNotif", "AudioNotificationModule: error unregistering receiver", e)
            }
        }
    }

    private fun canStartForegroundService(): Boolean {
        val activity = currentActivity
        return activity != null && !activity.isFinishing
    }
}
