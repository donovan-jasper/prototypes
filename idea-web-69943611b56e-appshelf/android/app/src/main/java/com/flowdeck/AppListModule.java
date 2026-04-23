package com.flowdeck;

import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.Canvas;
import android.graphics.drawable.Drawable;
import android.util.Base64;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;

import java.io.ByteArrayOutputStream;
import java.util.List;

public class AppListModule extends ReactContextBaseJavaModule {
    private final ReactApplicationContext reactContext;

    public AppListModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
    }

    @NonNull
    @Override
    public String getName() {
        return "AppListModule";
    }

    @ReactMethod
    public void getInstalledApps(Promise promise) {
        try {
            PackageManager pm = reactContext.getPackageManager();
            List<ApplicationInfo> packages = pm.getInstalledApplications(PackageManager.GET_META_DATA);

            WritableArray appsArray = new WritableNativeArray();

            for (ApplicationInfo appInfo : packages) {
                if ((appInfo.flags & ApplicationInfo.FLAG_SYSTEM) == 0) {
                    WritableMap appMap = new WritableNativeMap();

                    // Get app label
                    String label = pm.getApplicationLabel(appInfo).toString();
                    appMap.putString("label", label);

                    // Get package name
                    appMap.putString("packageName", appInfo.packageName);

                    // Get app icon
                    try {
                        Drawable icon = pm.getApplicationIcon(appInfo.packageName);
                        Bitmap bitmap = Bitmap.createBitmap(icon.getIntrinsicWidth(), icon.getIntrinsicHeight(), Bitmap.Config.ARGB_8888);
                        Canvas canvas = new Canvas(bitmap);
                        icon.setBounds(0, 0, canvas.getWidth(), canvas.getHeight());
                        icon.draw(canvas);

                        ByteArrayOutputStream byteArrayOutputStream = new ByteArrayOutputStream();
                        bitmap.compress(Bitmap.CompressFormat.PNG, 100, byteArrayOutputStream);
                        byte[] byteArray = byteArrayOutputStream.toByteArray();
                        String encoded = Base64.encodeToString(byteArray, Base64.DEFAULT);

                        appMap.putString("icon", encoded);
                    } catch (Exception e) {
                        appMap.putNull("icon");
                    }

                    appsArray.pushMap(appMap);
                }
            }

            promise.resolve(appsArray);
        } catch (Exception e) {
            promise.reject("ERROR", e);
        }
    }
}
