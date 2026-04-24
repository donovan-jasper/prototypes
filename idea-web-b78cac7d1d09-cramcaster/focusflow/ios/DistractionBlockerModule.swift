import ExpoModulesCore
import ScreenTime

public class DistractionBlockerModule: Module {
    private var screenTimeManager: STScreenTimeManager?
    private var observer: NSObjectProtocol?

    public func definition() -> ModuleDefinition {
        Name("DistractionBlockerModule")

        Function("requestScreenTimePermission") { () -> Bool in
            let center = STScreenTimeManager.shared()
            center.requestPermission { error in
                if let error = error {
                    print("Screen Time permission error: \(error.localizedDescription)")
                }
            }
            return true
        }

        Function("enableScreenTimeBlocking") { () -> Bool in
            let center = STScreenTimeManager.shared()
            center.startMonitoring()

            // Set up observer for app usage
            observer = NotificationCenter.default.addObserver(
                forName: .STScreenTimeDidChange,
                object: nil,
                queue: .main
            ) { [weak self] notification in
                self?.handleScreenTimeChange(notification)
            }

            return true
        }

        Function("disableScreenTimeBlocking") { () -> Bool in
            let center = STScreenTimeManager.shared()
            center.stopMonitoring()

            if let observer = observer {
                NotificationCenter.default.removeObserver(observer)
                self.observer = nil
            }

            return true
        }
    }

    private func handleScreenTimeChange(_ notification: Notification) {
        // Handle app usage changes here
        // You can check which apps are being used and take appropriate action
        // For example, you could force-quit blocked apps
        print("Screen time usage changed")
    }
}
