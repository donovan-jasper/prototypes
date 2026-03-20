package com.callguard;

import android.content.Context;
import android.telephony.PhoneStateListener;
import android.telephony.TelephonyManager;
import android.util.Log;
import android.Manifest;
import android.content.pm.PackageManager;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import javax.annotation.Nonnull;

public class CallGuardModule extends ReactContextBaseJavaModule {

    private static final String TAG = "CallGuardModule";
    private TelephonyManager telephonyManager;
    private CallStateListener callStateListener;
    private String lastCallerId = null; // To keep track of the caller ID for subsequent states

    public CallGuardModule(@Nonnull ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Nonnull
    @Override
    public String getName() {
        return "CallGuardModule";
    }

    private void sendEvent(String eventName, WritableMap params) {
        getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    @ReactMethod
    public void startCallMonitoring(Promise promise) {
        if (ContextCompat.checkSelfPermission(getReactApplicationContext(), Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) {
            Log.e(TAG, "READ_PHONE_STATE permission not granted.");
            promise.reject("PERMISSION_DENIED", "READ_PHONE_STATE permission is required to monitor call state.");
            return;
        }

        if (telephonyManager == null) {
            telephonyManager = (TelephonyManager) getReactApplicationContext().getSystemService(Context.TELEPHONY_SERVICE);
        }

        if (callStateListener == null) {
            callStateListener = new CallStateListener();
            telephonyManager.listen(callStateListener, PhoneStateListener.LISTEN_CALL_STATE);
            Log.d(TAG, "Call monitoring started.");
            promise.resolve(true);
        } else {
            Log.d(TAG, "Call monitoring already active.");
            promise.resolve(true);
        }
    }

    @ReactMethod
    public void stopCallMonitoring(Promise promise) {
        if (telephonyManager != null && callStateListener != null) {
            telephonyManager.listen(callStateListener, PhoneStateListener.LISTEN_NONE);
            callStateListener = null;
            telephonyManager = null;
            Log.d(TAG, "Call monitoring stopped.");
            promise.resolve(true);
        } else {
            Log.d(TAG, "Call monitoring not active.");
            promise.resolve(true);
        }
    }

    @ReactMethod
    public void answerCall(Promise promise) {
        // Programmatically answering a cellular call is highly restricted on Android
        // for third-party apps, especially from Android 9 (API 28) onwards.
        // It typically requires the app to be the default dialer or use InCallService,
        // which is a complex integration.
        // For a basic prototype, this is a placeholder.
        Log.w(TAG, "Attempted to answer call programmatically. This is generally not possible for third-party apps without being the default dialer or using InCallService.");
        promise.reject("NOT_POSSIBLE", "Answering cellular calls programmatically is not possible for third-party apps on Android without special permissions/roles.");
    }

    @ReactMethod
    public void endCall(Promise promise) {
        // Programmatically ending a cellular call is also highly restricted.
        // Similar to answering, it requires being the default dialer or using InCallService.
        Log.w(TAG, "Attempted to end call programmatically. This is generally not possible for third-party apps without being the default dialer or using InCallService.");
        promise.reject("NOT_POSSIBLE", "Ending cellular calls programmatically is not possible for third-party apps on Android without special permissions/roles.");
    }

    private class CallStateListener extends PhoneStateListener {
        @Override
        public void onCallStateChanged(int state, String incomingNumber) {
            super.onCallStateChanged(state, incomingNumber);
            WritableMap params = Arguments.createMap();
            params.putString("uuid", "android-call-" + System.currentTimeMillis()); // Android doesn't have UUIDs like iOS CallKit
            params.putString("callerId", incomingNumber != null && !incomingNumber.isEmpty() ? incomingNumber : lastCallerId);

            String eventName = "onCallStateChanged"; // Generic event
            String specificEvent = null;

            switch (state) {
                case TelephonyManager.CALL_STATE_RINGING:
                    Log.d(TAG, "CALL_STATE_RINGING: " + incomingNumber);
                    params.putString("state", "ringing");
                    params.putString("callerId", incomingNumber); // Ensure callerId is set for ringing
                    lastCallerId = incomingNumber;
                    specificEvent = "onIncomingCall";
                    break;
                case TelephonyManager.CALL_STATE_OFFHOOK:
                    Log.d(TAG, "CALL_STATE_OFFHOOK");
                    params.putString("state", "offhook");
                    specificEvent = "onCallAnswered";
                    break;
                case TelephonyManager.CALL_STATE_IDLE:
                    Log.d(TAG, "CALL_STATE_IDLE");
                    params.putString("state", "idle");
                    specificEvent = "onCallEnded";
                    lastCallerId = null; // Clear caller ID after call ends
                    break;
                default:
                    Log.d(TAG, "Unknown call state: " + state);
                    params.putString("state", "unknown");
                    break;
            }

            // Emit generic state change event
            sendEvent(eventName, params);

            // Emit specific event if applicable
            if (specificEvent != null) {
                sendEvent(specificEvent, params);
            }
        }
    }
}
