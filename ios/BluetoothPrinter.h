//
//  BluetoothPrinter.h
//  EscBluetoothPrinter
//
//  Created by januslo on 2018/9/28.
//  Copyright © 2018年 Facebook. All rights reserved.
//
#import <React/RCTBridge.h>
#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <CoreBluetooth/CoreBluetooth.h>

@protocol WriteDataToBleDelegate <NSObject>
@required
- (void) didWriteDataToBle: (BOOL)success;
@end

@interface BluetoothPrinter : RCTEventEmitter <RCTBridgeModule, CBCentralManagerDelegate, CBPeripheralDelegate>
@property (strong, nonatomic) CBCentralManager      *centralManager;
@property (nonatomic,copy) RCTPromiseResolveBlock scanResolveBlock;
@property (nonatomic,copy) RCTPromiseRejectBlock scanRejectBlock;
@property (strong,nonatomic) NSMutableDictionary <NSString *,CBPeripheral *> *foundDevices;
@property (strong,nonatomic) NSString *waitingConnect;
@property (nonatomic,copy) RCTPromiseResolveBlock connectResolveBlock;
@property (nonatomic,copy) RCTPromiseRejectBlock connectRejectBlock;
+(void)writeValue:(NSData *) data withDelegate:(NSObject<WriteDataToBleDelegate> *) delegate;
+(Boolean)isConnected;
-(void)initSupportServices;
-(void)callStop;
@end
