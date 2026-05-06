//
//  TscNetPrinter.h
//  QLBH
//
//  Created by dg on 19/11/24.
//  Copyright © 2024 Facebook. All rights reserved.
//

#import <React/RCTBridgeModule.h>
#import <React/RCTLog.h>
#import "TscCommand.h"

@interface TscNetPrinter : NSObject <RCTBridgeModule>

@property (nonatomic, strong) NSOutputStream *outputStream;
@property (nonatomic, strong) NSInputStream *inputStream;

@end

@interface MyTscCommand : TscCommand

-(void)addBitmap:(NSInteger) x y:(NSInteger) y
      bitmapMode:(NSInteger) mode width:(NSInteger) nWidth
          bitmap:(UIImage *) b;

@end
