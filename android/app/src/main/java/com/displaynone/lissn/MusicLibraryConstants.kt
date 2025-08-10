package com.displaynone.lissn

import android.net.Uri
import android.provider.MediaStore

const val GET_ASSETS_DEFAULT_LIMIT = 20.0

const val ERROR_UNABLE_TO_LOAD_PERMISSION = "E_UNABLE_TO_LOAD_PERMISSION"
const val ERROR_UNABLE_TO_SAVE_PERMISSION = "E_UNABLE_TO_SAVE_PERMISSION"
const val ERROR_UNABLE_TO_DELETE = "E_UNABLE_TO_DELETE"
const val ERROR_UNABLE_TO_LOAD = "E_UNABLE_TO_LOAD"
const val ERROR_UNABLE_TO_SAVE = "E_UNABLE_TO_SAVE"
const val ERROR_IO_EXCEPTION = "E_IO_EXCEPTION"
const val ERROR_NO_PERMISSIONS = "E_NO_PERMISSIONS"
const val ERROR_NO_PERMISSIONS_MESSAGE = "Missing MEDIA_LIBRARY permissions."
const val ERROR_NO_WRITE_PERMISSION_MESSAGE = "Missing MEDIA_LIBRARY write permission."
const val ERROR_USER_DID_NOT_GRANT_WRITE_PERMISSIONS_MESSAGE = "User didn't grant write permission to requested files."

// Use the audio specific content URI so we have access to all audio columns
// such as `title_key` which is required by DEFAULT_SORT_ORDER
val EXTERNAL_CONTENT_URI: Uri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI

val ASSET_PROJECTION = arrayOf(
  MediaStore.Audio.Media._ID,
  MediaStore.Audio.Media.TITLE,
  // Needed for DEFAULT_SORT_ORDER which uses this column
  MediaStore.Audio.Media.TITLE_KEY,
  MediaStore.Audio.Media.ARTIST,
  MediaStore.Audio.Media.DISPLAY_NAME,
  MediaStore.Audio.Media.DATE_ADDED,
  MediaStore.Audio.Media.DATE_MODIFIED,
  MediaStore.Audio.Media.DURATION,
  MediaStore.Audio.Media.DATA,
  MediaStore.Audio.Media.ALBUM, // Add album name for consistency
  // Use IDs directly from Media table
  MediaStore.Audio.Media.ALBUM_ID,
  MediaStore.Audio.Media.ARTIST_ID,
  MediaStore.Audio.Media.GENRE_ID,
)

val ALBUM_PROJECTION = arrayOf(
  MediaStore.Audio.Albums._ID,
  MediaStore.Audio.Albums.ALBUM,
  MediaStore.Audio.Albums.ARTIST,
  MediaStore.Audio.Albums.NUMBER_OF_SONGS
)

val ARTIST_PROJECTION = arrayOf(
  MediaStore.Audio.Artists._ID,
  MediaStore.Audio.Artists.ARTIST,
  MediaStore.Audio.Artists.NUMBER_OF_TRACKS,
)

val GENRE_PROJECTION = arrayOf(
  MediaStore.Audio.Genres._ID,
  MediaStore.Audio.Genres.NAME,
)