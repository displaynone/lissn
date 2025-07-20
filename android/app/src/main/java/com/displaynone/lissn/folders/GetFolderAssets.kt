package com.displaynone.lissn.folders

import android.content.Context
import android.provider.MediaStore
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableArray
import com.displaynone.lissn.ASSET_PROJECTION
import com.displaynone.lissn.AssetQueryException
import com.displaynone.lissn.ERROR_NO_PERMISSIONS
import com.displaynone.lissn.ERROR_UNABLE_TO_LOAD
import com.displaynone.lissn.ERROR_UNABLE_TO_LOAD_PERMISSION
import com.displaynone.lissn.assets.fillAssetBundle
import com.displaynone.lissn.models.Asset
import java.io.IOException

internal class GetFolderAssets(
        private val context: Context,
        private val folderId: String,
        private val promise: Promise
) {
    fun execute() {
        val contentResolver = context.contentResolver
        val selection = "${MediaStore.Audio.Media.BUCKET_ID} = ?"
        val selectionArgs = arrayOf(folderId)
        val sortBy = "${MediaStore.Audio.Media.DISPLAY_NAME} ASC"

        val assets = HashMap<String, Asset>()

        try {
            contentResolver.query(
                    MediaStore.Audio.Media.EXTERNAL_CONTENT_URI,
                    ASSET_PROJECTION,
                    selection,
                    selectionArgs,
                    sortBy
            ).use { assetsCursor ->
                if (assetsCursor == null) {
                    throw AssetQueryException()
                }
                fillAssetBundle(assetsCursor, assets)
                val writableArray: WritableArray = Arguments.createArray()
                for (asset in assets.values) {
                    writableArray.pushMap(Arguments.fromBundle(asset.toBundle()))
                }
                promise.resolve(writableArray)
            }
        } catch (e: SecurityException) {
            promise.reject(
                    ERROR_UNABLE_TO_LOAD_PERMISSION,
                    "Could not get asset: need READ_EXTERNAL_STORAGE permission.", e
            )
        } catch (e: IOException) {
            promise.reject(ERROR_UNABLE_TO_LOAD, "Could not read file", e)
        } catch (e: IllegalArgumentException) {
            promise.reject(ERROR_UNABLE_TO_LOAD, e.message ?: "Invalid MediaType", e)
        } catch (e: UnsupportedOperationException) {
            e.printStackTrace()
            promise.reject(ERROR_NO_PERMISSIONS, e.message, e)
        }
    }
}