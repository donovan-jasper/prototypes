package expo.modules.distractionblocker

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.view.accessibility.AccessibilityEvent
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class DistractionBlockerModule : Module() {
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

  override fun definition() = ModuleDefinition {
    Name("DistractionBlockerModule")

    Function("startAccessibilityService") {
      val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
      intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      context.startActivity(intent)
      true
    }

    Function("stopAccessibilityService") {
      // Implementation would stop the service
      true
    }
  }

  class DistractionBlockerService : AccessibilityService() {
    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
      if (event?.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
        val packageName = event.packageName?.toString()
        if (packageName in distractingApps) {
          performGlobalAction(GLOBAL_ACTION_HOME)
        }
      }
    }

    override fun onInterrupt() {}
  }
}
