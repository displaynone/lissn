package com.displaynone.lissn

import android.os.Build
import android.Manifest.permission.*
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.PermissionListener
import com.facebook.react.modules.core.PermissionAwareActivity
import com.displaynone.lissn.albums.GetAlbumAssets
import com.displaynone.lissn.albums.GetAlbums
import com.displaynone.lissn.artists.GetArtistAssets
import com.displaynone.lissn.artists.GetArtists
import com.displaynone.lissn.assets.GetAssets
import com.displaynone.lissn.assets.AssetsOptions
import com.displaynone.lissn.folders.GetFolderAssets
import com.displaynone.lissn.folders.GetFolders
import com.displaynone.lissn.genres.GetGenreAssets
import com.displaynone.lissn.genres.GetGenres
import kotlinx.coroutines.*

class ExpoMusicLibraryModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  private val coroutineScope = CoroutineScope(Dispatchers.IO)

  override fun getName(): String = "ExpoMusicLibrary"

  @ReactMethod
  fun getPermissionsAsync(promise: Promise) {
    val granted = hasPermissions()
    val result = Arguments.createMap()
    result.putString("status", if (granted) "granted" else "denied")
    promise.resolve(result)
  }

  @ReactMethod
  fun requestPermissionsAsync(promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity !is PermissionAwareActivity) {
      promise.reject("E_NO_ACTIVITY", "No permission aware activity available")
      return
    }

    if (hasPermissions()) {
      val result = Arguments.createMap()
      result.putString("status", "granted")
      promise.resolve(result)
      return
    }

    val permissions = getRequiredPermissions()
    val permissionListener = object : PermissionListener {
      override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<String>, grantResults: IntArray): Boolean {
        val granted = hasPermissions()
        val result = Arguments.createMap()
        result.putString("status", if (granted) "granted" else "denied")
        promise.resolve(result)
        return true
      }
    }

    activity.requestPermissions(permissions, 1, permissionListener)
  }

  @ReactMethod
  fun getAlbumsAsync(promise: Promise) {
    if (!hasPermissions()) {
      promise.reject("NO_PERMISSIONS", "Permissions not granted")
      return
    }

    coroutineScope.launch {
      try {
        GetAlbums(reactContext, promise).execute()
      } catch (e: Exception) {
        promise.reject("ALBUM_ERROR", e)
      }
    }
  }

  @ReactMethod
  fun getAlbumAssetsAsync(albumName: String, promise: Promise) {
    if (!hasPermissions()) {
      promise.reject("NO_PERMISSIONS", "Permissions not granted")
      return
    }

    coroutineScope.launch {
      try {
        GetAlbumAssets(reactContext, albumName, promise).execute()
      } catch (e: Exception) {
        promise.reject("ALBUM_ASSETS_ERROR", e)
      }
    }
  }

  @ReactMethod
  fun getAssetsAsync(options: ReadableMap, promise: Promise) {
    if (!hasPermissions()) {
      promise.reject("NO_PERMISSIONS", "Permissions not granted")
      return
    }

    coroutineScope.launch {
      try {
        val assetsOptions = AssetsOptions.fromReadableMap(options)
        GetAssets(reactContext, assetsOptions, promise).execute()
      } catch (e: Exception) {
        promise.reject("ASSETS_ERROR", e)
      }
    }
  }

  @ReactMethod
  fun getFoldersAsync(promise: Promise) {
    if (!hasPermissions()) {
      promise.reject("NO_PERMISSIONS", "Permissions not granted")
      return
    }

    coroutineScope.launch {
      try {
        GetFolders(reactContext, promise).execute()
      } catch (e: Exception) {
        promise.reject("FOLDERS_ERROR", e)
      }
    }
  }

  @ReactMethod
  fun getFolderAssetsAsync(folderId: String, promise: Promise) {
    if (!hasPermissions()) {
      promise.reject("NO_PERMISSIONS", "Permissions not granted")
      return
    }

    coroutineScope.launch {
      try {
        GetFolderAssets(reactContext, folderId, promise).execute()
      } catch (e: Exception) {
        promise.reject("FOLDER_ASSETS_ERROR", e)
      }
    }
  }

  @ReactMethod
  fun getArtistsAsync(promise: Promise) {
    if (!hasPermissions()) {
      promise.reject("NO_PERMISSIONS", "Permissions not granted")
      return
    }

    coroutineScope.launch {
      try {
        GetArtists(reactContext, promise).execute()
      } catch (e: Exception) {
        promise.reject("ARTISTS_ERROR", e)
      }
    }
  }

  @ReactMethod
  fun getArtistAssetsAsync(artistId: String, promise: Promise) {
    if (!hasPermissions()) {
      promise.reject("NO_PERMISSIONS", "Permissions not granted")
      return
    }

    coroutineScope.launch {
      try {
        GetArtistAssets(reactContext, artistId, promise).execute()
      } catch (e: Exception) {
        promise.reject("ARTIST_ASSETS_ERROR", e)
      }
    }
  }

  @ReactMethod
  fun getGenresAsync(promise: Promise) {
    if (!hasPermissions()) {
      promise.reject("NO_PERMISSIONS", "Permissions not granted")
      return
    }

    coroutineScope.launch {
      try {
        GetGenres(reactContext, promise).execute()
      } catch (e: Exception) {
        promise.reject("GENRES_ERROR", e)
      }
    }
  }

  @ReactMethod
  fun getGenreAssetsAsync(genreId: String, promise: Promise) {
    if (!hasPermissions()) {
      promise.reject("NO_PERMISSIONS", "Permissions not granted")
      return
    }

    coroutineScope.launch {
      try {
        GetGenreAssets(reactContext, genreId, promise).execute()
      } catch (e: Exception) {
        promise.reject("GENRE_ASSETS_ERROR", e)
      }
    }
  }

  private fun getRequiredPermissions(): Array<String> {
    return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      arrayOf(READ_MEDIA_AUDIO, READ_MEDIA_IMAGES, READ_MEDIA_VIDEO)
    } else {
      arrayOf(READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE)
    }
  }

  private fun hasPermissions(): Boolean {
    val permissions = getRequiredPermissions()

    return permissions.all {
      android.content.pm.PackageManager.PERMISSION_GRANTED ==
        reactContext.checkCallingOrSelfPermission(it)
    }
  }
}
