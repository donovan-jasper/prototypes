#import "CallGuardModule.h"
#import <React/RCTLog.h>
#import <CoreTelephony/CTCallCenter.h> // For older iOS versions, though CXCallObserver is preferred
#import <CoreTelephony/CTCall.h>

@interface CallGuardModule ()
@property (nonatomic, strong) CXCallObserver *callObserver;
@property (nonatomic, strong) CXProvider *callKitProvider;
@property (nonatomic, strong) NSUUID *currentCallUUID; // To track the current call if we were managing it
@property (nonatomic, strong) NSString *lastKnownCallerId; // To persist caller ID across state changes if available
@end

@implementation CallGuardModule

RCT_EXPORT_MODULE();

- (instancetype)init {
    self = [super init];
    if (self) {
        _callObserver = [[CXCallObserver alloc] init];
        [_callObserver setDelegate:self queue:nil];

        // CallKit Provider configuration (primarily for VoIP apps, but needed for some actions)
        // For a third-party app that only observes cellular calls, a full CXProvider setup
        // is not strictly necessary for observation, but it's good practice if you intend
        // to interact with CallKit in other ways (e.g., reporting calls, though not for cellular).
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
    
    // CallKit does not provide caller ID for cellular calls directly to third-party apps for privacy.
    // For incoming cellular calls, the callerId will be nil.
    // For outgoing calls, it might be available if the app initiated it or if it's a VoIP call.
    // We'll use a placeholder or nil for cellular calls.
    params[@"callerId"] = self.lastKnownCallerId ?: [NSNull null]; // Default to last known or null

    NSString *stateString = @"unknown";
    NSString *specificEvent = nil;

    if (call.hasEnded) {
        RCTLogInfo(@"Call ended: %@", call.UUID.UUIDString);
        stateString = @"idle";
        specificEvent = @"onCallEnded";
        self.lastKnownCallerId = nil; // Clear caller ID after call ends
    } else if (call.isOutgoing && !call.hasConnected) {
        // Outgoing call, not yet connected (dialing)
        RCTLogInfo(@"Outgoing call dialing: %@", call.UUID.UUIDString);
        stateString = @"dialing";
    } else if (call.isOutgoing && call.hasConnected) {
        // Outgoing call, connected
        RCTLogInfo(@"Outgoing call connected: %@", call.UUID.UUIDString);
        stateString = @"offhook";
        specificEvent = @"onCallAnswered"; // Treat outgoing connected as answered
    } else if (call.hasConnected && !call.isOnHold) {
        RCTLogInfo(@"Call connected: %@", call.UUID.UUIDString);
        stateString = @"offhook";
        specificEvent = @"onCallAnswered";
    } else if (call.isOnHold) {
        RCTLogInfo(@"Call on hold: %@", call.UUID.UUIDString);
        stateString = @"onhold";
    } else if (!call.isOutgoing && !call.hasConnected && !call.hasEnded) {
        // Incoming call, not yet connected (ringing)
        RCTLogInfo(@"Incoming call ringing: %@", call.UUID.UUIDString);
        stateString = @"ringing";
        specificEvent = @"onIncomingCall";
        // For incoming cellular calls, callerId is not available via CXCall.
        // We explicitly set it to null here to reflect this limitation.
        params[@"callerId"] = [NSNull null];
        self.lastKnownCallerId = nil; // Reset for new incoming call
    }
    
    params[@"state"] = stateString;

    // Emit generic state change event
    [self sendEventWithName:@"onCallStateChanged" body:params];

    // Emit specific event if applicable
    if (specificEvent != nil) {
        [self sendEventWithName:specificEvent body:params];
    }
}

// MARK: - CXProviderDelegate (Required for CXProvider, even if not performing actions)
// These methods are primarily for VoIP apps that manage their own calls.
// For a call observer, they might not be directly used for cellular calls.

- (void)providerDidReset:(CXProvider *)provider {
    RCTLogInfo(@"CXProvider did reset.");
}

- (void)provider:(CXProvider *)provider performAnswerCallAction:(CXAnswerCallAction *)action {
    RCTLogWarn(@"CXProvider received answer call action, but CallGuard does not manage cellular calls.");
    [action fail]; // Fail the action as we don't manage it
}

- (void)provider:(CXProvider *)provider performEndCallAction:(CXEndCallAction *)action {
    RCTLogWarn(@"CXProvider received end call action, but CallGuard does not manage cellular calls.");
    [action fail]; // Fail the action as we don't manage it
}

- (void)provider:(CXProvider *)provider performStartCallAction:(CXStartCallAction *)action {
    RCTLogWarn(@"CXProvider received start call action, but CallGuard does not manage cellular calls.");
    [action fail]; // Fail the action as we don't manage it
}

- (void)provider:(CXProvider *)provider didActivateAudioSession:(AVAudioSession *)audioSession {
    RCTLogInfo(@"CXProvider did activate audio session.");
    // This is where you would configure your audio session for VoIP calls.
}

- (void)provider:(CXProvider *)provider didDeactivateAudioSession:(AVAudioSession *)audioSession {
    RCTLogInfo(@"CXProvider did deactivate audio session.");
}

@end
