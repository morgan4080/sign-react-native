//
//  CountryData.m
//  PrestaSign
//
//  Created by Morgan Mutugi on 17/04/2023.
//

#import <Foundation/Foundation.h>
#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(CountryData, NSObject)

RCT_EXTERN_METHOD(getCountries:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject);

@end
