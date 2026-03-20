package com.callguard;

import android.Manifest;
import android.content.Context;
import android.content.pm.PackageManager;
import android.telecom.TelecomManager;
import android.telephony.PhoneStateListener;
import android.telephony.TelephonyManager;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.core.content.ContextCompat;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

public class CallGuardModule extends ReactContextBaseJavaModule {

    private static final String TAG = "CallGuardModule";
    private TelephonyManager telephonyManager;
    private TelecomManager telecomManager;
    private CallStateListener callStateListener;
    private ReactApplicationContext reactContext;

    // Event names
    private static final String EVENT_INCOMING_CALL = "onIncomingCall";
    private static final String EVENT_CALL_ANSWERED = "onCallAnswered";
    private static final String EVENT_CALL_ENDED = "onCallEnded";
    private static final String EVENT_CALL_STATE_CHANGED = "onCallStateChanged";

    public CallGuardModule(ReactApplicationContext reactContext) {
        super(reactContext);
        this.reactContext = reactContext;
        this.telephonyManager = (TelephonyManager) reactContext.getSystemService(Context.TELEPHONY_SERVICE);
        this.telecomManager = (TelecomManager) reactContext.getSystemService(Context.TELECOM_SERVICE);
    }

    @NonNull
    @Override
    public String getName() {
        return "CallGuardModule";
    }

    private void sendEvent(String eventName, WritableMap params) {
        reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(eventName, params);
    }

    @ReactMethod
    public void startCallMonitoring(Promise promise) {
        if (ContextCompat.checkSelfPermission(reactContext, Manifest.permission.READ_PHONE_STATE) != PackageManager.PERMISSION_GRANTED) {
            promise.reject("PERMISSION_DENIED", "READ_PHONE_STATE permission not granted.");
            return;
        }

        if (callStateListener == null) {
            callStateListener = new CallStateListener();
            telephonyManager.listen(callStateListener, PhoneStateListener.LISTEN_CALL_STATE);
            Log.d(TAG, "Call monitoring started.");
            promise.resolve(true);
        } else {
            promise.resolve(false); // Already started
        }
    }

    @ReactMethod
    public void stopCallMonitoring(Promise promise) {
        if (callStateListener != null) {
            telephonyManager.listen(callStateListener, PhoneStateListener.LISTEN_NONE);
            callStateListener = null;
            Log.d(TAG, "Call monitoring stopped.");
            promise.resolve(true);
        } else {
            promise.resolve(false); // Not started
        }
    }

    @ReactMethod
    public void answerCall(Promise promise) {
        if (ContextCompat.checkSelfPermission(reactContext, Manifest.permission.ANSWER_PHONE_CALLS) != PackageManager.PERMISSION_GRANTED) {
            promise.reject("PERMISSION_DENIED", "ANSWER_PHONE_CALLS permission not granted.");
            return;
        }
        if (telecomManager != null) {
            try {
                // This method is for Android 9 (API 28) and above.
                // For older versions, you might need to use reflection or broadcast intents.
                // Note: This might not work on all devices or for all call types.
                telecomManager.acceptRingingCall();
                promise.resolve(true);
                Log.d(TAG, "Attempted to answer call.");
            } catch (SecurityException e) {
                promise.reject("SECURITY_ERROR", "Failed to answer call due to security exception: " + e.getMessage());
                Log.e(TAG, "SecurityException when answering call: " + e.getMessage());
            } catch (Exception e) {
                promise.reject("ANSWER_ERROR", "Failed to answer call: " + e.getMessage());
                Log.e(TAG, "Error answering call: " + e.getMessage());
            }
        } else {
            promise.reject("NOT_AVAILABLE", "TelecomManager not available.");
        }
    }

    @ReactMethod
    public void endCall(Promise promise) {
        // Ending a call programmatically is highly restricted and often requires system permissions
        // or being the default dialer app. TelecomManager.endCall() is typically for ConnectionService
        // implementations (VoIP apps). For cellular calls, it's generally not possible for third-party apps.
        // This is a placeholder for a feature that is very difficult to implement for cellular calls.
        promise.reject("NOT_IMPLEMENTED", "Ending cellular calls programmatically is highly restricted and not implemented for third-party apps.");
    }

    private class CallStateListener extends PhoneStateListener {
        private String lastIncomingNumber = "";

        @Override
        public void onCallStateChanged(int state, String incomingNumber) {
            super.onCallStateChanged(state, incomingNumber);
            WritableMap params = Arguments.createMap();
            params.putString("incomingNumber", incomingNumber);

            switch (state) {
                case TelephonyManager.CALL_STATE_RINGING:
                    Log.d(TAG, "CALL_STATE_RINGING: " + incomingNumber);
                    lastIncomingNumber = incomingNumber;
                    params.putString("state", "ringing");
                    sendEvent(EVENT_INCOMING_CALL, params);
                    break;
                case TelephonyManager.CALL_STATE_OFFHOOK:
                    Log.d(TAG, "CALL_STATE_OFFHOOK");
                    params.putString("state", "offhook");
                    if (!lastIncomingNumber.isEmpty()) {
                        params.putString("callerId", lastIncomingNumber);
                        sendEvent(EVENT_CALL_ANSWERED, params);
                        lastIncomingNumber = ""; // Reset after call is answered
                    } else {
                        // This might be an outgoing call or a call answered without prior ringing detection
                        sendEvent(EVENT_CALL_ANSWERED, params);
                    }
                    break;
                case TelephonyManager.CALL_STATE_IDLE:
                    Log.d(TAG, "CALL_STATE_IDLE");
                    params.putString("state", "idle");
                    sendEvent(EVENT_CALL_ENDED, params);
                    lastIncomingNumber = ""; // Ensure reset
                    break;
            }
            sendEvent(EVENT_CALL_STATE_CHANGED, params); // Generic state change event
        }
    }
}
