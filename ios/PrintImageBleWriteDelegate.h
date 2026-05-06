//
//  RNPPrintImageBleWriteDelegate.h
//  EscBluetoothPrinter
//
//  Created by januslo on 2018/10/8.
//  Copyright © 2018年 Facebook. All rights reserved.
//
#import <React/RCTBridge.h>
#import "BluetoothManager.h"
#import "EscBluetoothPrinter.h"
@interface RNPPrintImageBleWriteDelegate :NSObject<WriteDataToBleDelegate>
@property NSData *toPrint;
@property NSInteger width;
@property NSInteger linesPerChunk;
@property NSInteger now;
@property BluetoothManager *printer;
@property RCTPromiseRejectBlock pendingReject;
@property RCTPromiseResolveBlock pendingResolve;
-(void) print;
@end
