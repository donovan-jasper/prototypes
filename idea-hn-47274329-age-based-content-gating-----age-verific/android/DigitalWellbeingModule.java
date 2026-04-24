package com.guardiangate;

import android.app.AppOpsManager;
import android.content.Context;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Process;
import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.google.android.digitalwellbeing.DigitalWellbeingManager;
import com.google.android.digitalwellbeing.Quota;
import com.google.android.digitalwellbeing.QuotaSpec;
import com.google.android.digitalwellbeing.QuotaType;
import java.util.HashSet;
import java.util.Set;

public class DigitalWellbeingModule extends ReactContextBaseJavaModule {
  private final ReactApplicationContext reactContext;
  private DigitalWellbeingManager digitalWellbeingManager;
  private String currentProfile;

  public DigitalWellbeingModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      this.digitalWellbeingManager = reactContext.getSystemService(DigitalWellbeingManager.class);
    }
  }

  @NonNull
  @Override
  public String getName() {
    return "DigitalWellbeingModule";
  }

  @ReactMethod
  public void isAvailable(Promise promise) {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
      promise.resolve(true);
    } else {
      promise.resolve(false);
    }
  }

  @ReactMethod
  public void getStatus(Promise promise) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) {
      promise.resolve(createStatusResponse(false, false, null));
      return;
    }

    try {
      boolean isEnabled = checkIfEnabled();
      promise.resolve(createStatusResponse(true, isEnabled, currentProfile));
    } catch (Exception e) {
      promise.reject("ERROR", e.getMessage());
    }
  }

  @ReactMethod
  public void enableContentFilter(ReadableMap config, Promise promise) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) {
      promise.reject("ERROR", "Digital Wellbeing API not available");
      return;
    }

    try {
      if (!checkIfEnabled()) {
        enableDigitalWellbeing();
      }

      if (config.hasKey("profileType")) {
        currentProfile = config.getString("profileType");
      }

      boolean success = configureContentFilter(config);
      promise.resolve(success);
    } catch (Exception e) {
      promise.reject("ERROR", e.getMessage());
    }
  }

  @ReactMethod
  public void disableContentFilter(Promise promise) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) {
      promise.reject("ERROR", "Digital Wellbeing API not available");
      return;
    }

    try {
      if (checkIfEnabled()) {
        disableDigitalWellbeing();
      }

      currentProfile = null;
      promise.resolve(true);
    } catch (Exception e) {
      promise.reject("ERROR", e.getMessage());
    }
  }

  @ReactMethod
  public void updateContentFilter(ReadableMap config, Promise promise) {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.P) {
      promise.reject("ERROR", "Digital Wellbeing API not available");
      return;
    }

    try {
      boolean success = configureContentFilter(config);
      promise.resolve(success);
    } catch (Exception e) {
      promise.reject("ERROR", e.getMessage());
    }
  }

  @RequiresApi(api = Build.VERSION_CODES.P)
  private boolean checkIfEnabled() {
    AppOpsManager appOps = reactContext.getSystemService(AppOpsManager.class);
    int mode = appOps.checkOpNoThrow(
      AppOpsManager.OPSTR_GET_USAGE_STATS,
      Process.myUid(),
      reactContext.getPackageName()
    );
    return mode == AppOpsManager.MODE_ALLOWED;
  }

  @RequiresApi(api = Build.VERSION_CODES.P)
  private void enableDigitalWellbeing() {
    // In a real app, you would request the permission here
    // For this prototype, we'll assume it's already granted
  }

  @RequiresApi(api = Build.VERSION_CODES.P)
  private void disableDigitalWellbeing() {
    // In a real app, you would revoke the permission here
  }

  @RequiresApi(api = Build.VERSION_CODES.P)
  private boolean configureContentFilter(ReadableMap config) {
    // Create a new quota for content filtering
    QuotaSpec.Builder quotaSpecBuilder = new QuotaSpec.Builder(QuotaType.TIME);

    // Set time limit (0 means no limit)
    quotaSpecBuilder.setTimeLimit(0);

    // Set allowed domains if provided
    if (config.hasKey("allowedDomains")) {
      Set<String> allowedDomains = new HashSet<>();
      for (String domain : config.getArray("allowedDomains").toArrayList()) {
        allowedDomains.add(domain);
      }
      quotaSpecBuilder.setAllowedDomains(allowedDomains);
    }

    // Set blocked domains if provided
    if (config.hasKey("blockedDomains")) {
      Set<String> blockedDomains = new HashSet<>();
      for (String domain : config.getArray("blockedDomains").toArrayList()) {
        blockedDomains.add(domain);
      }
      quotaSpecBuilder.setBlockedDomains(blockedDomains);
    }

    // Set content restrictions
    if (config.hasKey("blockAdultContent") && config.getBoolean("blockAdultContent")) {
      quotaSpecBuilder.setBlockAdultContent(true);
    }

    if (config.hasKey("blockExplicitContent") && config.getBoolean("blockExplicitContent")) {
      quotaSpecBuilder.setBlockExplicitContent(true);
    }

    // Set search restrictions
    if (config.hasKey("restrictWebSearch") && config.getBoolean("restrictWebSearch")) {
      quotaSpecBuilder.setRestrictWebSearch(true);
    }

    // Set assistant restrictions
    if (config.hasKey("restrictAssistant") && config.getBoolean("restrictAssistant")) {
      quotaSpecBuilder.setRestrictAssistant(true);
    }

    // Create the quota
    QuotaSpec quotaSpec = quotaSpecBuilder.build();

    // Apply the quota
    digitalWellbeingManager.setQuotaSpec(quotaSpec);

    return true;
  }

  private Object createStatusResponse(boolean available, boolean enabled, String profileType) {
    return new Object() {
      public boolean available = available;
      public boolean enabled = enabled;
      public String profileType = profileType;
    };
  }
}
