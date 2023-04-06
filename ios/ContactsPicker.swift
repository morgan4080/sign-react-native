//
//  ContactsPicker.swift
//  PrestaSign
//
//  Created by user236190 on 4/6/23.
//

import Foundation
import ContactsUI

@objc(ContactsPicker)
class ContactsPicker: UIViewController, CNContactPickerDelegate {
  @objc
  func getContact() {
    let contactPicker = CNContactPickerViewController()
    contactPicker.delegate = self
    contactPicker.displayedPropertyKeys = [CNContactGivenNameKey, CNContactPhoneNumbersKey]
    present(contactPicker, animated: true, completion: nil)
  }
  
  func contactPicker(_ picker: CNContactPickerViewController, didSelect contact: CNContact) {
    // handle selected contact
  }
  
  func contactPickerDidCancel(_ picker: CNContactPickerViewController) {
    
  }
  
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true;
  }
  
}
