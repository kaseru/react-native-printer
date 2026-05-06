//
//  TscBluetoothPrinter.h
//  EscBluetoothPrinter
//
//  Created by januslo on 2018/10/1.
//  Copyright © 2018年 Facebook. All rights reserved.
//
#import <React/RCTBridge.h>
#import "BluetoothManager.h"
@interface TscBluetoothPrinter : NSObject <RCTBridge,WriteDataToBleDelegate>

@end

