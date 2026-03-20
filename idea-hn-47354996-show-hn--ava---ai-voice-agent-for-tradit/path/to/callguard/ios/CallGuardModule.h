#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <CallKit/CallKit.h>

@interface CallGuardModule : RCTEventEmitter <RCTBridgeModule, CXCallObserverDelegate>

@end
