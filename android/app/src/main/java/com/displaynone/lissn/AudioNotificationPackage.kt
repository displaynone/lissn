package com.displaynone.lissn

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class AudioNotificationPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): MutableList<NativeModule> {
        return mutableListOf(AudioNotificationModule(reactContext))
    }
    override fun createViewManagers(reactContext: ReactApplicationContext)
        = mutableListOf<ViewManager<*, *>>()
}
