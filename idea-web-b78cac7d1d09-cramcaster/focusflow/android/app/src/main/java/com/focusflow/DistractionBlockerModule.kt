package com.focusflow

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Context
import android.content.Intent
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityManager
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class DistractionBlockerModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("DistractionBlockerModule")

        Function("startAccessibilityService") {
            val intent = Intent(context, FocusFlowAccessibilityService::class.java)
            context.startService(intent)
        }

        Function("stopAccessibilityService") {
            val intent = Intent(context, FocusFlowAccessibilityService::class.java)
            context.stopService(intent)
        }
    }
}

class FocusFlowAccessibilityService : AccessibilityService() {
    private val distractingApps = listOf(
        "com.facebook.katana",
        "com.instagram.android",
        "com.snapchat.android",
        "com.twitter.android",
        "com.whatsapp",
        "com.tiktok.android",
        "com.spotify.music",
        "com.netflix.mediaclient",
        "com.disney.disneyplus"
    )

    override fun onServiceConnected() {
        val info = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS
            notificationTimeout = 100
        }
        serviceInfo = info
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            val packageName = event.packageName?.toString() ?: return
            if (distractingApps.contains(packageName)) {
                performGlobalAction(GLOBAL_ACTION_HOME)
            }
        }
    }

    override fun onInterrupt() {}
}
