import ExpoModulesCore
import ScreenTime

public class DistractionBlockerModule: Module {
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

    Function("disableScreenTimeBlocking") { () -> Bool in
      let center = STScreenTimeManager.shared()
      center.stopMonitoring()
      return true
    }
  }
}
