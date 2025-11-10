package com.displaynone.lissn

import android.app.*
import android.content.*
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.media.app.NotificationCompat.MediaStyle
import android.support.v4.media.session.PlaybackStateCompat
import android.net.Uri
import android.util.Log
import com.facebook.react.ReactApplication
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.util.concurrent.TimeUnit
import kotlin.jvm.Volatile

class AudioNotificationService : Service() {

    companion object {
        const val CHANNEL_ID = "lissn_audio_player_channel"
        const val NOTIFICATION_ID = 1001
        @Volatile
        private var serviceRunning = false

        @JvmStatic
        fun isRunning(): Boolean = serviceRunning

        const val ACTION_PLAY_PAUSE = "com.displaynone.lissn.PLAY_PAUSE"
        const val ACTION_NEXT = "com.displaynone.lissn.NEXT"
        const val ACTION_PREV = "com.displaynone.lissn.PREV"
        const val ACTION_STOP = "com.displaynone.lissn.STOP"
        const val ACTION_SEEK_TO = "com.displaynone.lissn.SEEK_TO"

        const val EXTRA_TITLE = "title"
        const val EXTRA_ARTIST = "artist"
        const val EXTRA_SMALL_ICON_NAME = "smallIconName"
        const val EXTRA_LARGE_ICON_PATH = "largeIconPath"
        const val EXTRA_IS_PLAYING = "isPlaying"
        const val EXTRA_CURRENT_TIME = "currentTime"
        const val EXTRA_DURATION = "duration"
    }

    private lateinit var mediaSessionHelper: MediaSessionHelper
    private var lastTitle: String = "Playing"
    private var lastArtist: String = ""
    private var lastIsPlaying: Boolean = true
    private var lastSmallIconName: String? = null
    private var lastLargeBitmap: Bitmap? = null
    private var lastCurrentTime: Long = 0L
    private var lastDuration: Long = 0L
    private var actionReceiver: BroadcastReceiver? = null
    private val pendingActions = mutableListOf<String>()

    // Scope para trabajos en background (IO) del servicio
    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onCreate() {
        super.onCreate()
        serviceRunning = true
        mediaSessionHelper = MediaSessionHelper(this) { action -> handleAction(action) }
        createChannel()
        registerActionReceiver()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        intent?.let {
            if (it.action == "REACT_NATIVE_READY") {
                onReactNativeReady()
                return START_STICKY
            }

            lastTitle = it.getStringExtra(EXTRA_TITLE) ?: lastTitle
            lastArtist = it.getStringExtra(EXTRA_ARTIST) ?: lastArtist
            lastIsPlaying = it.getBooleanExtra(EXTRA_IS_PLAYING, lastIsPlaying)
            lastSmallIconName = it.getStringExtra(EXTRA_SMALL_ICON_NAME) ?: lastSmallIconName
            lastCurrentTime = it.getLongExtra(EXTRA_CURRENT_TIME, lastCurrentTime)
            lastDuration = it.getLongExtra(EXTRA_DURATION, lastDuration)

            // Si nos pasan una portada, la cargamos en background (HTTPS)
            it.getStringExtra(EXTRA_LARGE_ICON_PATH)?.let { path ->
                lastLargeBitmap = null // placeholder sin portada
                serviceScope.launch {
                    val bmp = loadBitmapFromPath(path)
                    if (bmp != null) {
                        lastLargeBitmap = bmp
                        // tras cargar, refrescamos metadata y notificación
                        updatePlaybackState(lastIsPlaying)
                        showOrUpdateNotification()
                    }
                }
            }
        }

        // Actualización inmediata (sin bloquear por la imagen)
        updatePlaybackState(lastIsPlaying)
        showOrUpdateNotification()

        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        mediaSessionHelper.release()
        unregisterActionReceiver()
        serviceScope.cancel() // cancela corrutinas en curso
        serviceRunning = false
    }

    private fun createChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val mgr = getSystemService(NotificationManager::class.java)
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Music player",
                NotificationManager.IMPORTANCE_LOW
            )
            mgr.createNotificationChannel(channel)
        }
    }

    private fun buildActionPendingIntent(action: String): PendingIntent {
        val intent = Intent(this, AudioNotificationReceiver::class.java).apply {
            this.action = action
            setPackage(packageName)
        }
        return PendingIntent.getBroadcast(
            this,
            action.hashCode(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    private fun resolveSmallIcon(): Int {
        val name = lastSmallIconName ?: "ic_music_note"
        val id = resources.getIdentifier(name, "drawable", packageName)
        return if (id != 0) id else R.drawable.ic_music_note
    }

    private fun updatePlaybackState(isPlaying: Boolean) {
        val state = if (isPlaying) PlaybackStateCompat.STATE_PLAYING else PlaybackStateCompat.STATE_PAUSED
        val currentPosition = if (lastCurrentTime > 0) lastCurrentTime * 1000 else PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN
        val playbackSpeed = if (isPlaying) 1.0f else 0.0f

        mediaSessionHelper.setPlaybackState(state, currentPosition, playbackSpeed)

        val durationMs = if (lastDuration > 0) lastDuration * 1000 else null
        mediaSessionHelper.setMetadata(lastTitle, lastArtist, lastLargeBitmap, durationMs)
    }

    private fun showOrUpdateNotification() {
        val smallIconId = resolveSmallIcon()

        val openAppIntent = Intent(Intent.ACTION_VIEW, Uri.parse("lissn://song/playing")).apply {
            setPackage(packageName)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
        val contentPendingIntent = PendingIntent.getActivity(
            this,
            0,
            openAppIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val builder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(lastTitle)
            .setContentText(lastArtist)
            .setSmallIcon(smallIconId)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setContentIntent(contentPendingIntent)
            .setStyle(
                MediaStyle()
                    .setMediaSession(mediaSessionHelper.sessionToken)
                    .setShowActionsInCompactView(0, 1, 2)
            )
            .addAction(R.drawable.ic_prev, "Prev", buildActionPendingIntent(ACTION_PREV))
            .addAction(
                if (lastIsPlaying) R.drawable.ic_pause else R.drawable.ic_play,
                if (lastIsPlaying) "Pause" else "Play",
                buildActionPendingIntent(ACTION_PLAY_PAUSE)
            )
            .addAction(R.drawable.ic_next, "Next", buildActionPendingIntent(ACTION_NEXT))
            .addAction(R.drawable.ic_close, "Stop", buildActionPendingIntent(ACTION_STOP))

        lastLargeBitmap?.let { builder.setLargeIcon(it) }

        val notification = builder.build()
        startForeground(NOTIFICATION_ID, notification)
    }

    private val httpClient by lazy {
        OkHttpClient.Builder()
            .connectTimeout(5, TimeUnit.SECONDS)
            .readTimeout(7, TimeUnit.SECONDS)
            .build()
    }

    // Carga imagen desde content/file/HTTPS. NO soporta HTTP (intencionado).
    private suspend fun loadBitmapFromPath(path: String): Bitmap? = withContext(Dispatchers.IO) {
        try {
            val uri = Uri.parse(path)
            when (uri.scheme?.lowercase()) {
                "content" -> contentResolver.openInputStream(uri)?.use(BitmapFactory::decodeStream)
                "file"    -> BitmapFactory.decodeFile(uri.path)
                "https"   -> downloadBitmapHttpsOnly(uri.toString())
                // sin esquema o ruta absoluta
                null, ""  -> BitmapFactory.decodeFile(path)
                // explícitamente NO soportamos http
                else      -> null
            }
        } catch (e: Exception) {
            Log.w("Lissn/ART", "Error loading bitmap: ${e.message}")
            null
        }
    }

    private fun downloadBitmapHttpsOnly(url: String): Bitmap? {
        val req = Request.Builder()
            .url(url)
            .header("User-Agent", "Lissn/1.0 (Android)")
            .build()

        httpClient.newCall(req).execute().use { resp ->
            if (!resp.isSuccessful) return null
            // Asegura que la URL final sigue siendo HTTPS
            if (resp.request.url.scheme != "https") return null
            val ct = resp.header("Content-Type") ?: return null
            if (!ct.startsWith("image/")) return null
            return resp.body?.byteStream()?.use(BitmapFactory::decodeStream)
        }
    }

    fun updateFromJS(
        title: String?,
        artist: String?,
        isPlaying: Boolean?,
        smallIconName: String?,
        largeIconPath: String?,
        currentTime: Long? = null,
        duration: Long? = null
    ) {
        title?.let { lastTitle = it }
        artist?.let { lastArtist = it }
        isPlaying?.let { lastIsPlaying = it }
        smallIconName?.let { lastSmallIconName = it }
        currentTime?.let { lastCurrentTime = it }
        duration?.let { lastDuration = it }

        // Carga asíncrona de la portada si llega ruta nueva
        if (!largeIconPath.isNullOrBlank()) {
            lastLargeBitmap = null
            serviceScope.launch {
                val bmp = loadBitmapFromPath(largeIconPath)
                if (bmp != null) {
                    lastLargeBitmap = bmp
                    updatePlaybackState(lastIsPlaying)
                    showOrUpdateNotification()
                }
            }
        }

        // Actualiza inmediatamente (sin bloquear por la imagen)
        updatePlaybackState(lastIsPlaying)
        showOrUpdateNotification()
    }

    private fun registerActionReceiver() {
        val filter = IntentFilter().apply {
            addAction(ACTION_PLAY_PAUSE)
            addAction(ACTION_NEXT)
            addAction(ACTION_PREV)
            addAction(ACTION_STOP)
            addAction(ACTION_SEEK_TO)
        }

        actionReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                val action = intent?.action ?: return
                handleAction(action)
            }
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(actionReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(actionReceiver, filter)
        }
    }

    private fun unregisterActionReceiver() {
        actionReceiver?.let {
            unregisterReceiver(it)
            actionReceiver = null
        }
    }

    private fun handleAction(action: String) {
        try {
            val app = applicationContext as ReactApplication
            val reactCtx = app.reactNativeHost.reactInstanceManager.currentReactContext

            if (reactCtx != null) {
                val eventName = when (action) {
                    ACTION_PLAY_PAUSE -> "audio-notif-play-pause"
                    ACTION_NEXT -> "audio-notif-next"
                    ACTION_PREV -> "audio-notif-prev"
                    ACTION_STOP -> "audio-notif-stop"
                    ACTION_SEEK_TO -> "audio-notif-seek-to"
                    else -> null
                }

                eventName?.let { event ->
                    val intent = Intent("audio-notif-action").apply {
                        putExtra("action", event)
                        setPackage(packageName)
                    }
                    sendBroadcast(intent)
                }
            } else {
                val reactInstanceManager = app.reactNativeHost.reactInstanceManager
                if (!reactInstanceManager.hasStartedCreatingInitialContext()) {
                    reactInstanceManager.createReactContextInBackground()
                }

                val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
                launchIntent?.let {
                    it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                    startActivity(it)
                }

                savePendingAction(action)
            }
        } catch (e: Exception) {
            Log.e("LissnNotif", "Error handling action: $action", e)
        }
    }

    private fun savePendingAction(action: String) {
        synchronized(pendingActions) {
            pendingActions.removeAll { it == action }
            pendingActions.add(action)
        }
    }

    private fun processPendingActions() {
        synchronized(pendingActions) {
            if (pendingActions.isNotEmpty()) {
                val actionsToProcess = pendingActions.toList()
                pendingActions.clear()
                actionsToProcess.forEach { action -> handleAction(action) }
            }
        }
    }

    fun onReactNativeReady() {
        processPendingActions()
    }
}
