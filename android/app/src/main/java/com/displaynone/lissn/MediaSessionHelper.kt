package com.displaynone.lissn

import android.content.Context
import android.graphics.Bitmap
import android.support.v4.media.MediaMetadataCompat
import android.support.v4.media.session.MediaSessionCompat
import android.support.v4.media.session.PlaybackStateCompat
import android.content.Intent
import android.util.Log

class MediaSessionHelper(private val context: Context, private val actionCallback: ((String) -> Unit)? = null) {

    private val mediaSessionCallback = object : MediaSessionCompat.Callback() {
        override fun onPlay() {
            sendBroadcastAction("com.displaynone.lissn.PLAY_PAUSE")
        }

        override fun onPause() {
            sendBroadcastAction("com.displaynone.lissn.PLAY_PAUSE")
        }

        override fun onPlayFromMediaId(mediaId: String?, extras: android.os.Bundle?) {
            sendBroadcastAction("com.displaynone.lissn.PLAY_PAUSE")
        }

        override fun onSkipToNext() {
            sendBroadcastAction("com.displaynone.lissn.NEXT")
        }

        override fun onSkipToPrevious() {
            sendBroadcastAction("com.displaynone.lissn.PREV")
        }

        override fun onStop() {
            sendBroadcastAction("com.displaynone.lissn.STOP")
        }

        override fun onSeekTo(pos: Long) {
            // Convertir de milisegundos a segundos y enviar la acción
            val seconds = pos / 1000.0
            sendBroadcastActionWithData("com.displaynone.lissn.SEEK_TO", seconds)
        }
    }

    private val session = MediaSessionCompat(context, "LissnMediaSession").apply {
        isActive = true
        setCallback(mediaSessionCallback)
    }

    val sessionToken = session.sessionToken

    fun setPlaybackState(state: Int, position: Long = PlaybackStateCompat.PLAYBACK_POSITION_UNKNOWN, playbackSpeed: Float = 1.0f) {
        val playbackState = PlaybackStateCompat.Builder()
            .setActions(
                PlaybackStateCompat.ACTION_PLAY or
                PlaybackStateCompat.ACTION_PAUSE or
                PlaybackStateCompat.ACTION_PLAY_PAUSE or
                PlaybackStateCompat.ACTION_SKIP_TO_NEXT or
                PlaybackStateCompat.ACTION_SKIP_TO_PREVIOUS or
                PlaybackStateCompat.ACTION_STOP or
                PlaybackStateCompat.ACTION_PLAY_FROM_MEDIA_ID or
                PlaybackStateCompat.ACTION_SEEK_TO
            )
            .setState(state, position, playbackSpeed)
            .build()

        session.setPlaybackState(playbackState)
    }

    fun setMetadata(title: String, artist: String, art: Bitmap? = null, duration: Long? = null) {
        val b = MediaMetadataCompat.Builder()
            .putString(MediaMetadataCompat.METADATA_KEY_TITLE, title)
            .putString(MediaMetadataCompat.METADATA_KEY_ARTIST, artist)

        art?.let {
            b.putBitmap(MediaMetadataCompat.METADATA_KEY_ALBUM_ART, it)
            b.putBitmap(MediaMetadataCompat.METADATA_KEY_ART, it)
        }

        duration?.let {
            b.putLong(MediaMetadataCompat.METADATA_KEY_DURATION, it)
        }

        session.setMetadata(b.build())
    }

    private fun sendBroadcastAction(action: String) {
        actionCallback?.let { callback ->
            callback(action)
            return
        }

        val intent = Intent(action)
        context.sendBroadcast(intent)
    }

    private fun sendBroadcastActionWithData(action: String, data: Double) {
        val intent = Intent("audio-notif-action").apply {
            putExtra("action", when(action) {
                "com.displaynone.lissn.SEEK_TO" -> "audio-notif-seek-to"
                else -> action
            })
            putExtra("seekPosition", data)
            setPackage(context.packageName)
        }
        context.sendBroadcast(intent)
    }

    fun release() {
        session.isActive = false
        session.release()
    }
}
