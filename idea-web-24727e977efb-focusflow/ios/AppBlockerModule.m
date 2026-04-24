#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(AppBlockerModule, NSObject)

RCT_EXTERN_METHOD(blockApps:(NSArray<NSString *> *)apps)
RCT_EXTERN_METHOD(unblockApps)

@end
