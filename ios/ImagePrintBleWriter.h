//
//  ImagePrintBleWriter.h
//  EscBluetoothPrinter
//
//  Created by januslo on 2018/10/8.
//  Copyright © 2018年 Facebook. All rights reserved.
//
#import <React/RCTBridge.h>
#import "BluetoothPrinter.h"
#import "EscBluetoothPrinter.h"
@interface ImagePrintBleWriter :NSObject<WriteDataToBleDelegate>
@property NSData *toPrint;
@property NSInteger width;
@property NSInteger linesPerChunk;
@property NSInteger now;
@property BluetoothPrinter *printer;
@property RCTPromiseRejectBlock pendingReject;
@property RCTPromiseResolveBlock pendingResolve;
-(void) print;
@end
