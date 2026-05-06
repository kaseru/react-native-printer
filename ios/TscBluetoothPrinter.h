//
//  TscBluetoothPrinter.h
//  EscBluetoothPrinter
//
//  Created by januslo on 2018/10/1.
//  Copyright © 2018年 Facebook. All rights reserved.
//
#import <React/RCTBridgeModule.h>
#import "BluetoothPrinter.h"
@interface TscBluetoothPrinter : NSObject <RCTBridgeModule, WriteDataToBleDelegate>

@end
