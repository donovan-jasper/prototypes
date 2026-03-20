#import "CallGuardModule.h"
#import <React/RCTLog.h>

@interface CallGuardModule ()
@property (nonatomic, strong) CXCallObserver *callObserver;
@property (nonatomic, strong) CXProvider *callKitProvider;
@property (nonatomic, strong) NSUUID *currentCallUUID; // To track the current call if we were managing it
@end

@implementation CallGuardModule

RCT_EXPORT_MODULE();

- (instancetype)init {
    self = [super init];
    if (self) {
        _callObserver = [[CXCallObserver alloc] init];
        [_callObserver setDelegate:self queue:nil];

        // CallKit Provider configuration (primarily for VoIP apps, but needed for some actions)
        CXProviderConfiguration *config = [[CXProviderConfiguration alloc] initWithLocalizedName:@"CallGuard"];
        config.supportsVideo = NO;
        config.maximumCallsPerCallGroup = 1;
        config.supportedHandleTypes = [NSSet setWithObject:@(CXHandleTypeGeneric)]; // Or CXHandleTypePhoneNumber
        _callKitProvider = [[CXProvider alloc] initWithConfiguration:config];
        [_callKitProvider setDelegate:self queue:nil]; // Set delegate for provider actions
    }
    return self;
}

// Required for RCTEventEmitter
- (NSArray<NSString *> *)supportedEvents {
    return @[@"onIncomingCall", @"onCallAnswered", @"onCallEnded", @"onCallStateChanged"];
}

// MARK: - RCTBridgeModule Methods

RCT_EXPORT_METHOD(startCallMonitoring:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    // CallKit observer is always active once initialized.
    // We don't need explicit start/stop for the observer itself.
    // Permissions for CallKit are implicitly handled when the app interacts with it.
    RCTLogInfo(@"Call monitoring started (iOS observer is always active).");
    resolve(@(YES));
}

RCT_EXPORT_METHOD(stopCallMonitoring:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    // CallKit observer cannot be explicitly stopped. It observes system calls.
    RCTLogInfo(@"Call monitoring cannot be explicitly stopped on iOS (observer is always active).");
    resolve(@(YES));
}

RCT_EXPORT_METHOD(answerCall:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    // Answering a cellular call programmatically is highly restricted on iOS.
    // CallKit's CXAnswerCallAction is primarily for VoIP apps that integrate with CallKit.
    // A third-party app cannot directly answer an incoming *cellular* call.
    // This method is a placeholder for a feature that is not possible for cellular calls.
    RCTLogError(@"Attempted to answer call programmatically. This is not possible for cellular calls on iOS for third-party apps.");
    reject(@"NOT_POSSIBLE", @"Answering cellular calls programmatically is not possible on iOS for third-party apps.", nil);
}

RCT_EXPORT_METHOD(endCall:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
    // Ending a cellular call programmatically is also highly restricted.
    // CXEndCallAction is for calls managed by the app's CXProvider (VoIP).
    // A third-party app cannot directly end an ongoing *cellular* call.
    RCTLogError(@"Attempted to end call programmatically. This is not possible for cellular calls on iOS for third-party apps.");
    reject(@"NOT_POSSIBLE", @"Ending cellular calls programmatically is not possible on iOS for third-party apps.", nil);
}

// MARK: - CXCallObserverDelegate

- (void)callObserver:(CXCallObserver *)callObserver callChanged:(CXCall *)call {
    NSMutableDictionary *params = [NSMutableDictionary dictionary];
    params[@"uuid"] = call.UUID.UUIDString;

    if (call.hasEnded) {
        RCTLogInfo(@"Call ended: %@", call.UUID.UUIDString);
        params[@"state"] = @"idle";
        [self sendEventWithName:@"onCallEnded" body:params];
    } else if (call.isOutgoing && !call.isOnHold && !call.hasConnected) {
        // Outgoing call, not yet connected (dialing)
        RCTLogInfo(@"Outgoing call dialing: %@", call.UUID.UUIDString);
        params[@"state"] = @"dialing";
    } else if (call.isOutgoing && call.hasConnected) {
        // Outgoing call, connected
        RCTLogInfo(@"Outgoing call connected: %@", call.UUID.UUIDString);
        params[@"state"] = @"offhook";
    } else if (call.hasConnected && !call.isOnHold) {
        RCTLogInfo(@"Call connected: %@", call.UUID.UUIDString);
        params[@"state"] = @"offhook";
        [self sendEventWithName:@"onCallAnswered" body:params];
    } else if (call.isOnHold) {
        RCTLogInfo(@"Call on hold: %@", call.UUID.UUIDString);
        params[@"state"] = @"onhold";
    } else if (!call.isOutgoing && !call.hasConnected && !call.hasEnded) {
        // Incoming call, not yet connected (ringing)
        RCTLogInfo(@"Incoming call ringing: %@", call.UUID.UUIDString);
        params[@"state"] = @"ringing";
        // CallKit does not provide caller ID for cellular calls directly to third-party apps for privacy.
        // You would need to use CNContactStore to match the number if it's in contacts,
        // but the number itself is not given for unknown callers.
        params[@"incomingNumber"] = @"Unknown"; // Placeholder, actual number is not accessible for privacy
        [self sendEventWithName:@"onIncomingCall" body:params];
    }
    [self sendEventWithName:@"onCallStateChanged" body:params];
}

// MARK: - CXProviderDelegate (Required for CXProvider, even if not fully used for cellular calls)

- (void)providerDidReset:(CXProvider *)provider {
    RCTLogInfo(@"CXProvider did reset");
}

- (void)provider:(CXProvider *)provider performAnswerCallAction:(CXAnswerCallAction *)action {
    // This is called when the user answers a call *that our app initiated or is managing* (VoIP).
    // Not for cellular calls.
    [action fulfill];
}

- (void)provider:(CXProvider *)provider performEndCallAction:(CXEndCallAction *)action {
    // This is called when the user ends a call *that our app initiated or is managing* (VoIP).
    // Not for cellular calls.
    [action fulfill];
}

- (void)provider:(CXProvider *)provider performStartCallAction:(CXStartCallAction *)action {
    // This is called when our app wants to start a call (VoIP).
    [action fulfill];
}

- (void)provider:(CXProvider *)provider didActivateAudioSession:(AVAudioSession *)audioSession {
    // This is where you would configure your app's audio session for VoIP calls.
    // For cellular calls, the system manages the audio session.
    RCTLogInfo(@"CXProvider did activate audio session");
}

- (void)provider:(CXProvider *)provider didDeactivateAudioSession:(AVAudioSession *)audioSession {
    RCTLogInfo(@"CXProvider did deactivate audio session");
}

@end
