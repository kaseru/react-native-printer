//
//  ColumnPrintBleWriter.h
//  EscBluetoothPrinter
//
//  Created by januslo on 2018/10/6.
//  Copyright © 2018年 Facebook. All rights reserved.
//
#import <React/RCTBridge.h>
#import "BluetoothPrinter.h"
#import "EscBluetoothPrinter.h"

@interface ColumnPrintBleWriter:NSObject<WriteDataToBleDelegate>
@property NSInteger now;
@property Boolean error;
@property RCTPromiseResolveBlock pendingResolve;
@property RCTPromiseRejectBlock pendingReject;
@property EscBluetoothPrinter *printer;
@property Boolean canceled;
@property NSString *encodig;
@property NSInteger codePage;
@property NSInteger widthTimes;
@property NSInteger heightTimes;
@property NSInteger fontType;
-(void)printColumn:(NSMutableArray<NSMutableString *> *) columnsToPrint withMaxcount:(NSInteger)maxcount;
@end
