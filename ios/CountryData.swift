//
//  CountryData.swift
//  PrestaSign
//
//  Created by Morgan Mutugi on 17/04/2023.
//

import Foundation

@objc(CountryData)
class CountryData: NSObject {
  
  @objc func constantsToExport() -> [String: Any] {
    return [
      "name": "CountryData",
    ]
  }
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc
  func getCountries(_ resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    if let url = Bundle.main.url(forResource: "Countries", withExtension: "json") {
      do {
        let data = try Data(contentsOf: url, options: .mappedIfSafe)
        let jsonObject = try JSONSerialization.jsonObject(with: data, options: .mutableLeaves)
        resolve(jsonObject)
      } catch {
        reject("getCountries", "Could not serialize country data", nil)
      }
    } else {
      reject("getCountries", "Url to countries file not available", nil)
    }
  }
}
