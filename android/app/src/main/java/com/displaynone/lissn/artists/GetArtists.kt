package com.displaynone.lissn.artists

import android.content.Context
import android.database.Cursor.FIELD_TYPE_NULL
import android.os.Bundle
import android.provider.MediaStore.Audio.Artists
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.displaynone.lissn.ARTIST_PROJECTION
import com.displaynone.lissn.AlbumException
import com.displaynone.lissn.ERROR_UNABLE_TO_LOAD
import com.displaynone.lissn.ERROR_UNABLE_TO_LOAD_PERMISSION

internal open class GetArtists(
    private val context: Context,
    private val promise: Promise
) {
    fun execute() {
        val projection = ARTIST_PROJECTION

        val artists = HashMap<String, Artist>()

        try {
            context.contentResolver
                .query(
                    Artists.EXTERNAL_CONTENT_URI,
                    projection,
                    null,
                    null,
                    "${Artists.ARTIST} ASC"
                )
                .use { artistCursor ->
                    if (artistCursor == null) {
                        throw AlbumException("Could not get artists. Query returns null")
                    }
                    val artistIdIndex = artistCursor.getColumnIndex(Artists._ID)
                    val artistDisplayNameIndex = artistCursor.getColumnIndex(Artists.ARTIST)
                    val artistSongsIndex = artistCursor.getColumnIndex(Artists.NUMBER_OF_TRACKS)

                    while (artistCursor.moveToNext()) {
                        val id = artistCursor.getString(artistIdIndex)

                        if (artistCursor.getType(artistDisplayNameIndex) == FIELD_TYPE_NULL) {
                            continue
                        }

                        val artist = artists[id] ?: Artist(
                            id = id ?: "",
                            title = artistCursor.getString(artistDisplayNameIndex) ?: "Unknown",
                            artistSongs = artistCursor.getInt(artistSongsIndex)
                        ).also {
                            artists[id ?: ""] = it
                        }

                        artist.count++
                    }

                    val writableArray: WritableArray = Arguments.createArray()
                    for (artist in artists.values) {
                        writableArray.pushMap(Arguments.fromBundle(artist.toBundle()))
                    }
                    promise.resolve(writableArray)
                }
        } catch (e: SecurityException) {
            promise.reject(
                ERROR_UNABLE_TO_LOAD_PERMISSION,
                "Could not get artists: need READ_EXTERNAL_STORAGE permission.", e
            )
        } catch (e: RuntimeException) {
            promise.reject(ERROR_UNABLE_TO_LOAD, "Could not get artists.", e)
        }
    }

    private class Artist(private val id: String, private val title: String, var count: Int = 0, private val artistSongs:Int) {
        fun toBundle() = Bundle().apply {
            putString("id", id)
            putString("title", title)
            putInt("assetCount", count)
            putInt("artistSongs", artistSongs)
        }
    }
}