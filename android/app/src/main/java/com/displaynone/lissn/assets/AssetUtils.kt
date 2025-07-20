package com.displaynone.lissn.assets

import android.database.Cursor
import android.net.Uri
import android.os.Bundle
import android.provider.MediaStore
import com.displaynone.lissn.ASSET_PROJECTION
import com.displaynone.lissn.models.Asset
import java.io.IOException

/**
 * Reads given `cursor` and saves the data to `response` param.
 * Reads `limit` rows, starting by `offset`.
 * Cursor must be a result of query with [ASSET_PROJECTION] projection
 */
@Throws(IOException::class, UnsupportedOperationException::class)
fun putAssetsInfo(
    cursor: Cursor,
    response: MutableList<Bundle>,
    limit: Int,
    offset: Int
) {
    val idIndex = cursor.getColumnIndex(MediaStore.Audio.Media._ID)
    val titleIndex = cursor.getColumnIndex(MediaStore.Audio.Media.TITLE)
    val artistIndex = cursor.getColumnIndex(MediaStore.Audio.Media.ARTIST)
    val filenameIndex = cursor.getColumnIndex(MediaStore.Audio.Media.DISPLAY_NAME)
    val creationDateIndex = cursor.getColumnIndex(MediaStore.Audio.Media.DATE_ADDED)
    val modificationDateIndex = cursor.getColumnIndex(MediaStore.Audio.Media.DATE_MODIFIED)
    val durationIndex = cursor.getColumnIndex(MediaStore.Audio.Media.DURATION)
    val localUriIndex = cursor.getColumnIndex(MediaStore.Audio.Media.DATA)
    val albumNameIndex = cursor.getColumnIndex(MediaStore.Audio.Media.ALBUM)
    val albumIdIndex = cursor.getColumnIndex(MediaStore.Audio.Albums._ID)
    val artistIdIndex = cursor.getColumnIndex(MediaStore.Audio.Artists._ID)
    val genreIdIndex = cursor.getColumnIndex(MediaStore.Audio.Genres._ID)

    if (!cursor.moveToPosition(offset)) {
        return
    }

    var i = 0
    while (i < limit && !cursor.isAfterLast) {
        val assetId = cursor.getString(idIndex)
        val path = cursor.getString(localUriIndex)
        val localUri = "file://$path"
        val artworkUri: Uri = Uri.parse("content://media/external/audio/media/${assetId}/albumart")

        val title = if (titleIndex != -1) cursor.getString(titleIndex) else cursor.getString(filenameIndex)

        val asset = Bundle().apply {
            putString("id", assetId ?: "")
            putString("title", title ?: "Unknown")
            putString("artist", cursor.getString(artistIndex) ?: "Unknown")
            putString("artwork", artworkUri.toString())
            putString("filename", cursor.getString(filenameIndex) ?: "Unknown")
            putString("uri", localUri)
            putString("mediaType", "audio")
            putLong("creationTime", cursor.getLong(creationDateIndex))
            putDouble("modificationTime", cursor.getLong(modificationDateIndex) * 1000.0)
            putDouble("duration", cursor.getInt(durationIndex) / 1000.0)
            putString("albumId", cursor.getString(albumNameIndex) ?: "Unknown") // Use album name instead of ID
            putString("originalAlbumId", cursor.getString(albumIdIndex) ?: "") // Keep original ID for reference
            putString("artistId", cursor.getString(artistIdIndex) ?: "")
            putString("genreId", cursor.getString(genreIdIndex) ?: "")
        }

        cursor.moveToNext()
        response.add(asset)
        i++
    }
}

@Throws(IOException::class, UnsupportedOperationException::class)
fun fillAssetBundle(
    cursor: Cursor,
    assets: HashMap<String, Asset>
) {
    val idIndex = cursor.getColumnIndex(MediaStore.Audio.Media._ID)
    val titleIndex = cursor.getColumnIndex(MediaStore.Audio.Media.TITLE)
    val artistIndex = cursor.getColumnIndex(MediaStore.Audio.Media.ARTIST)
    val filenameIndex = cursor.getColumnIndex(MediaStore.Audio.Media.DISPLAY_NAME)
    val creationDateIndex = cursor.getColumnIndex(MediaStore.Audio.Media.DATE_ADDED)
    val modificationDateIndex = cursor.getColumnIndex(MediaStore.Audio.Media.DATE_MODIFIED)
    val durationIndex = cursor.getColumnIndex(MediaStore.Audio.Media.DURATION)
    val localUriIndex = cursor.getColumnIndex(MediaStore.Audio.Media.DATA)
    val albumNameIndex = cursor.getColumnIndex(MediaStore.Audio.Media.ALBUM)
    val albumIdIndex = cursor.getColumnIndex(MediaStore.Audio.Albums._ID)
    val artistIdIndex = cursor.getColumnIndex(MediaStore.Audio.Artists._ID)
    val genreIdIndex = cursor.getColumnIndex(MediaStore.Audio.Genres._ID)

    while (cursor.moveToNext()) {
        val assetId = cursor.getString(idIndex)
        val path = cursor.getString(localUriIndex)
        val localUri = "file://$path"
        val artworkUri: Uri = Uri.parse("content://media/external/audio/media/${assetId}/albumart")

        val title = if (titleIndex != -1) cursor.getString(titleIndex) else cursor.getString(filenameIndex)

        Asset(
            id = assetId ?: "",
            title = title ?: "Unknown",
            artist = cursor.getString(artistIndex) ?: "Unknown",
            artwork = artworkUri.toString(),
            filename = cursor.getString(filenameIndex) ?: "Unknown",
            localUri = localUri,
            mediaType = "audio",
            creationTime = cursor.getLong(creationDateIndex),
            modificationTime = cursor.getLong(modificationDateIndex) * 1000.0,
            duration = cursor.getInt(durationIndex) / 1000.0,
            albumId = cursor.getString(albumNameIndex) ?: "Unknown", // Use album name instead of ID
            originalAlbumId = cursor.getString(albumIdIndex) ?: "", // Keep original ID for reference
            artistId = cursor.getString(artistIdIndex) ?: "",
            genreId = cursor.getString(genreIdIndex) ?: ""
        ).also {
            assets[assetId ?: ""] = it
        }
    }
}

