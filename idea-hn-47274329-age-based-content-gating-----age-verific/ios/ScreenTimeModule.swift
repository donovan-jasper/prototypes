import Foundation
import ScreenTime

@objc(ScreenTimeModule)
class ScreenTimeModule: NSObject {
  private var screenTimeManager: ScreenTimeManager?

  override init() {
    super.init()
    self.screenTimeManager = ScreenTimeManager()
  }

  @objc
  func isAvailable(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    if #available(iOS 12.0, *) {
      resolve(true)
    } else {
      resolve(false)
    }
  }

  @objc
  func getStatus(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    guard let manager = screenTimeManager else {
      resolve(["available": false, "enabled": false])
      return
    }

    let status = manager.getStatus()
    resolve(status)
  }

  @objc
  func enableContentFilter(_ config: NSDictionary, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    guard let manager = screenTimeManager else {
      reject("ERROR", "ScreenTimeManager not initialized", nil)
      return
    }

    do {
      let success = try manager.enableContentFilter(config: config)
      resolve(success)
    } catch {
      reject("ERROR", error.localizedDescription, error)
    }
  }

  @objc
  func disableContentFilter(_ resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    guard let manager = screenTimeManager else {
      reject("ERROR", "ScreenTimeManager not initialized", nil)
      return
    }

    do {
      let success = try manager.disableContentFilter()
      resolve(success)
    } catch {
      reject("ERROR", error.localizedDescription, error)
    }
  }

  @objc
  func updateContentFilter(_ config: NSDictionary, resolve: RCTPromiseResolveBlock, reject: RCTPromiseRejectBlock) {
    guard let manager = screenTimeManager else {
      reject("ERROR", "ScreenTimeManager not initialized", nil)
      return
    }

    do {
      let success = try manager.updateContentFilter(config: config)
      resolve(success)
    } catch {
      reject("ERROR", error.localizedDescription, error)
    }
  }

  @objc
  static func requiresMainQueueSetup() -> Bool {
    return false
  }
}

class ScreenTimeManager {
  private var contentFilter: STContentFilter?
  private var currentProfile: String?

  func getStatus() -> [String: Any] {
    if #available(iOS 12.0, *) {
      let status = STContentFilter.status()
      return [
        "available": true,
        "enabled": status == .enabled,
        "profileType": currentProfile ?? ""
      ]
    } else {
      return ["available": false, "enabled": false]
    }
  }

  func enableContentFilter(config: NSDictionary) throws -> Bool {
    guard #available(iOS 12.0, *) else {
      throw NSError(domain: "ScreenTime", code: -1, userInfo: [NSLocalizedDescriptionKey: "Screen Time API not available"])
    }

    // Create content filter configuration
    let filterConfig = STContentFilterConfiguration()

    // Set profile type
    if let profileType = config["profileType"] as? String {
      currentProfile = profileType
    }

    // Set content restrictions
    if let blockAdultContent = config["blockAdultContent"] as? Bool {
      filterConfig.blockAdultContent = blockAdultContent
    }

    if let blockExplicitContent = config["blockExplicitContent"] as? Bool {
      filterConfig.blockExplicitContent = blockExplicitContent
    }

    // Set allowed domains
    if let allowedDomains = config["allowedDomains"] as? [String] {
      filterConfig.allowedDomains = Set(allowedDomains)
    }

    // Set blocked domains
    if let blockedDomains = config["blockedDomains"] as? [String] {
      filterConfig.blockedDomains = Set(blockedDomains)
    }

    // Set search restrictions
    if let restrictWebSearch = config["restrictWebSearch"] as? Bool {
      filterConfig.restrictWebSearch = restrictWebSearch
    }

    // Set Siri restrictions
    if let restrictSiri = config["restrictSiri"] as? Bool {
      filterConfig.restrictSiri = restrictSiri
    }

    // Create and enable content filter
    contentFilter = STContentFilter(configuration: filterConfig)
    try contentFilter?.enable()

    return true
  }

  func disableContentFilter() throws -> Bool {
    guard #available(iOS 12.0, *) else {
      throw NSError(domain: "ScreenTime", code: -1, userInfo: [NSLocalizedDescriptionKey: "Screen Time API not available"])
    }

    contentFilter?.disable()
    contentFilter = nil
    currentProfile = nil

    return true
  }

  func updateContentFilter(config: NSDictionary) throws -> Bool {
    guard #available(iOS 12.0, *) else {
      throw NSError(domain: "ScreenTime", code: -1, userInfo: [NSLocalizedDescriptionKey: "Screen Time API not available"])
    }

    guard let currentFilter = contentFilter else {
      throw NSError(domain: "ScreenTime", code: -1, userInfo: [NSLocalizedDescriptionKey: "No active content filter"])
    }

    // Create new configuration based on current one
    let newConfig = currentFilter.configuration

    // Update with new values
    if let blockAdultContent = config["blockAdultContent"] as? Bool {
      newConfig.blockAdultContent = blockAdultContent
    }

    if let blockExplicitContent = config["blockExplicitContent"] as? Bool {
      newConfig.blockExplicitContent = blockExplicitContent
    }

    if let allowedDomains = config["allowedDomains"] as? [String] {
      newConfig.allowedDomains = Set(allowedDomains)
    }

    if let blockedDomains = config["blockedDomains"] as? [String] {
      newConfig.blockedDomains = Set(blockedDomains)
    }

    if let restrictWebSearch = config["restrictWebSearch"] as? Bool {
      newConfig.restrictWebSearch = restrictWebSearch
    }

    if let restrictSiri = config["restrictSiri"] as? Bool {
      newConfig.restrictSiri = restrictSiri
    }

    // Update the filter
    try currentFilter.update(with: newConfig)

    return true
  }
}
