#import "AppDelegate.h"
#import <EXScreenTime/EXScreenTime.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  // Register for Screen Time notifications
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(handleScreenTimeChange:)
                                               name:STScreenTimeDidChangeNotification
                                             object:nil];

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (void)handleScreenTimeChange:(NSNotification *)notification
{
  // Handle Screen Time changes here
  // You can check which apps are being used and take appropriate action
}

@end
