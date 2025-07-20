package com.displaynone.lissn.albums

import android.content.ContentUris
import android.content.Context
import android.database.Cursor.FIELD_TYPE_NULL
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore.Audio.Albums
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.displaynone.lissn.ALBUM_PROJECTION
import com.displaynone.lissn.AlbumException
import com.displaynone.lissn.ERROR_UNABLE_TO_LOAD
import com.displaynone.lissn.ERROR_UNABLE_TO_LOAD_PERMISSION

internal open class GetAlbums(
    private val context: Context,
    private val promise: Promise
) {
    fun execute() {
        val albums = HashMap<String, Album>()

        try {
            context.contentResolver
                .query(
                    Albums.EXTERNAL_CONTENT_URI,
                    ALBUM_PROJECTION,
                    null,
                    null,
                    "${Albums.ALBUM} ASC",
                )
                .use { albumsCursor ->
                    if (albumsCursor == null) {
                        throw AlbumException("Could not get albums. Query returns null")
                    }
                    val bucketIdIndex = albumsCursor.getColumnIndex(Albums._ID)
                    val bucketDisplayNameIndex = albumsCursor.getColumnIndex(Albums.ALBUM)
                    val bucketArtistIndex = albumsCursor.getColumnIndex(Albums.ARTIST)
                    val albumSongsIndex = albumsCursor.getColumnIndex(Albums.NUMBER_OF_SONGS)

                    while (albumsCursor.moveToNext()) {
                        val id = albumsCursor.getString(bucketIdIndex)
                        val albumName = albumsCursor.getString(bucketDisplayNameIndex) ?: "Unknown"

                        if (albumsCursor.getType(bucketDisplayNameIndex) == FIELD_TYPE_NULL) {
                            continue
                        }
                        val artworkUri: Uri = Uri.parse("content://media/external/audio/albumart")
                        val albumArtPath: Uri = ContentUris.withAppendedId(artworkUri, albumsCursor.getLong(bucketIdIndex))

                        // Use album name as primary identifier for consistency with MediaStore queries
                        val album = albums[albumName] ?: Album(
                            id = albumName, // Use album name as primary ID
                            originalId = id ?: "", // Keep original ID as separate field
                            title = albumName,
                            artwork = albumArtPath.toString(),
                            artist = albumsCursor.getString(bucketArtistIndex) ?: "Unknown",
                            albumSongs = albumsCursor.getInt(albumSongsIndex)
                        ).also {
                            albums[albumName] = it
                        }

                        album.count++
                    }

                    val writableArray: WritableArray = Arguments.createArray()
                    for (album in albums.values) {
                        writableArray.pushMap(Arguments.fromBundle(album.toBundle()))
                    }
                    promise.resolve(writableArray)
                }
        } catch (e: SecurityException) {
            promise.reject(
                ERROR_UNABLE_TO_LOAD_PERMISSION,
                "Could not get albums: need READ_EXTERNAL_STORAGE permission.", e
            )
        } catch (e: RuntimeException) {
            promise.reject(ERROR_UNABLE_TO_LOAD, "Could not get albums.", e)
        }
    }

    private class Album(
        private val id: String,
        private val originalId: String,
        private val title: String,
        var count: Int = 0,
        private val artwork: String,
        private val artist: String,
        private val albumSongs: Int
    ) {
        fun toBundle() = Bundle().apply {
            putString("id", id) // This is now the album name
            putString("originalId", originalId) // Keep original ID for reference
            putString("title", title)
            putString("artwork", artwork)
            putString("artist", artist)
            putInt("assetsCount", count)
            putInt("albumSongs", albumSongs)
        }
    }
}