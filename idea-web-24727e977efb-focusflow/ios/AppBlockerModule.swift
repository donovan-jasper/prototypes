import Foundation
import UIKit

@objc(AppBlockerModule)
class AppBlockerModule: NSObject {
  private var blockedApps: [String] = []
  private var observer: NSObjectProtocol?

  @objc
  func blockApps(_ apps: [String]) {
    blockedApps = apps
    setupAppLaunchObserver()
  }

  @objc
  func unblockApps() {
    blockedApps = []
    removeAppLaunchObserver()
  }

  private func setupAppLaunchObserver() {
    observer = NotificationCenter.default.addObserver(
      forName: UIApplication.didBecomeActiveNotification,
      object: nil,
      queue: .main
    ) { [weak self] _ in
      self?.checkForBlockedApps()
    }
  }

  private func removeAppLaunchObserver() {
    if let observer = observer {
      NotificationCenter.default.removeObserver(observer)
    }
  }

  private func checkForBlockedApps() {
    guard let currentApp = UIApplication.shared.topMostViewController()?.navigationController?.viewControllers.last else {
      return
    }

    let bundleIdentifier = Bundle.main.bundleIdentifier ?? ""

    if blockedApps.contains(bundleIdentifier) {
      // App is blocked, show alert and try to close it
      DispatchQueue.main.async {
        let alert = UIAlertController(
          title: "Focus Mode Active",
          message: "This app is blocked during your focus session. Please close it.",
          preferredStyle: .alert
        )

        alert.addAction(UIAlertAction(title: "OK", style: .default) { _ in
          // Try to close the app
          UIControl().sendAction(#selector(URLSessionTask.suspend), to: UIApplication.shared, for: nil)
        })

        currentApp.present(alert, animated: true, completion: nil)
      }
    }
  }
}

extension UIApplication {
  func topMostViewController() -> UIViewController? {
    guard let rootViewController = keyWindow?.rootViewController else {
      return nil
    }

    var topViewController = rootViewController
    while let presentedViewController = topViewController.presentedViewController {
      topViewController = presentedViewController
    }

    return topViewController
  }
}
