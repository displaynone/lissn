package com.displaynone.lissn.assets

import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.ReadableArray

data class AssetsOptions(
  val first: Int = 100,
  val after: String? = null,
  val album: String? = null,
  val sortBy: List<String> = emptyList(),
  val createdAfter: Double? = null,
  val createdBefore: Double? = null
) {
  companion object {
    fun fromReadableMap(map: ReadableMap): AssetsOptions {
      val first = if (map.hasKey("first") && !map.isNull("first")) map.getInt("first") else 100
      val after = if (map.hasKey("after") && !map.isNull("after")) map.getString("after") else null
      val album = if (map.hasKey("album") && !map.isNull("album")) map.getString("album") else null

      val sortBy: List<String> = if (map.hasKey("sortBy") && !map.isNull("sortBy")) {
        val array: ReadableArray = map.getArray("sortBy")!!
        List(array.size()) { index -> array.getString(index) ?: "" }
      } else {
        emptyList()
      }

      val createdAfter = if (map.hasKey("createdAfter") && !map.isNull("createdAfter")) {
        map.getDouble("createdAfter")
      } else {
        null
      }

      val createdBefore = if (map.hasKey("createdBefore") && !map.isNull("createdBefore")) {
        map.getDouble("createdBefore")
      } else {
        null
      }

      return AssetsOptions(
        first = first,
        after = after,
        album = album,
        sortBy = sortBy,
        createdAfter = createdAfter,
        createdBefore = createdBefore
      )
    }
  }
}
