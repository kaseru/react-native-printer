//
//  PrintColumnBleWriteDelegate.h
//  RNEscBluetoothPrinter
//
//  Created by januslo on 2018/10/6.
//  Copyright © 2018年 Facebook. All rights reserved.
//
#import <React/RCTBridgeModule.h>
#import "RNBluetoothManager.h"
#import "RNEscBluetoothPrinter.h"

@interface PrintColumnBleWriteDelegate:NSObject<WriteDataToBleDelegate>
@property NSInteger now;
@property Boolean error;
@property RCTPromiseResolveBlock pendingResolve;
@property RCTPromiseRejectBlock pendingReject;
@property RNEscBluetoothPrinter *printer;
@property Boolean canceled;
@property NSString *encodig;
@property NSInteger codePage;
@property NSInteger widthTimes;
@property NSInteger heightTimes;
@property NSInteger fontType;
-(void)printColumn:(NSMutableArray<NSMutableString *> *) columnsToPrint withMaxcount:(NSInteger)maxcount;
@end
