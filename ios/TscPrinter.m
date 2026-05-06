//
//  TscPrinter.m
//  QLBH
//
//  Created by dg on 19/11/24.
//  Copyright © 2024 Facebook. All rights reserved.
//

#import "TscPrinter.h"
#import <React/RCTLog.h>
#import <React/RCTBridge.h>
#import <UIKit/UIKit.h>
#import "TscBluetoothPrinter.h"
#import "ImageUtils.h"
#import <Foundation/Foundation.h>
#import <sys/socket.h>
#import <netinet/in.h>
#import <arpa/inet.h>
#import <fcntl.h>
#import <unistd.h>
#import <errno.h>

@implementation MyTscCommand

NSData* convertImageToBitmapBytes(UIImage *image) {
    if (!image) {
        NSLog(@"Error: Image is nil");
        return nil;
    }
    
    // Chuyển ảnh sang chế độ grayscale
    CGSize size = image.size;
    int width = size.width;
    int height = size.height;
    
    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceGray();
    CGContextRef context = CGBitmapContextCreate(NULL, width, height, 8, width, colorSpace, kCGImageAlphaNone);
    if (!context) {
        NSLog(@"Error: Failed to create bitmap context");
        CGColorSpaceRelease(colorSpace);
        return nil;
    }
    
    CGContextDrawImage(context, CGRectMake(0, 0, width, height), image.CGImage);
    unsigned char *pixelData = CGBitmapContextGetData(context);
    if (!pixelData) {
        NSLog(@"Error: Failed to get pixel data");
        CGContextRelease(context);
        CGColorSpaceRelease(colorSpace);
        return nil;
    }

    // Chuyển đổi pixel data sang dạng BITMAP (1 bpp)
    int widthInBytes = (width + 7) / 8; // Tính chiều rộng (theo byte)
    NSMutableData *bitmapData = [NSMutableData dataWithLength:widthInBytes * height];
    unsigned char *bitmapBytes = bitmapData.mutableBytes;
    
    for (int y = 0; y < height; y++) {
        for (int x = 0; x < width; x++) {
            unsigned char gray = pixelData[y * width + x]; // Giá trị grayscale
            if (gray >= 128) { // Đánh dấu pixel "trắng" (xử lý)
                int byteIndex = (y * widthInBytes) + (x / 8);
                int bitIndex = 7 - (x % 8);
                bitmapBytes[byteIndex] |= (1 << bitIndex); // Đánh dấu bit của pixel trắng
            }
            // Nếu pixel màu đen, không cần phải làm gì vì mặc định là 0 (để bỏ qua)
        }
    }
    
    // Giải phóng tài nguyên
    CGContextRelease(context);
    CGColorSpaceRelease(colorSpace);

    return [bitmapData copy]; // Trả về dữ liệu bitmap
}

- (void)addBitmap:(NSInteger)x y:(NSInteger)y bitmapMode:(NSInteger)mode width:(NSInteger)nWidth bitmap:(UIImage *)b {
  if (b) {
      CGFloat imgWidth = b.size.width;
      CGFloat imgHeigth = b.size.height;
      NSInteger width = (nWidth + 7) / 8 * 8;
      NSInteger height = imgHeigth * width / imgWidth;
      UIImage *resized = [ImageUtils imageWithImage:b scaledToFillSize:CGSizeMake(width, height)];
      uint8_t * graybits = [ImageUtils imageToGreyImage:resized];
      NSInteger srcLen = (int)resized.size.width*resized.size.height;
      // NSData *codecontent = [ImageUtils pixToTscCmd:graybits width:srcLen];
      height = srcLen / width;
      width /= 8;
      NSString *str =[NSString stringWithFormat:@ "BITMAP %ld,%ld,%ld,%ld,%ld,",
                      x,y,width,height,mode];
      [self addStrToCommand:str];
      NSData *bitmapData = convertImageToBitmapBytes(resized);
      [self.command  appendData:bitmapData];
      [self addStrToCommand:@"\r\n"];
  }
}
@end

@implementation TscPrinter

RCT_EXPORT_MODULE();  // Đảm bảo module được export đúng

// Ping printer
RCT_EXPORT_METHOD(ping:(NSString *)ip
                  timeout:(nonnull NSNumber *)timeoutMs
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
    int sockfd = socket(AF_INET, SOCK_STREAM, 0);
    if (sockfd < 0) {
      resolve(@NO);
      return;
    }

    struct sockaddr_in serv_addr;
    serv_addr.sin_family = AF_INET;
    serv_addr.sin_port = htons(9100);
    serv_addr.sin_addr.s_addr = inet_addr([ip UTF8String]);
    memset(&(serv_addr.sin_zero), 0, 8);

    // Set non-blocking
    int flags = fcntl(sockfd, F_GETFL, 0);
    fcntl(sockfd, F_SETFL, flags | O_NONBLOCK);

    int ret = connect(sockfd, (struct sockaddr *)&serv_addr, sizeof(serv_addr));
    if (ret < 0 && errno != EINPROGRESS) {
      close(sockfd);
      resolve(@NO);
      return;
    }

    fd_set fdset;
    FD_ZERO(&fdset);
    FD_SET(sockfd, &fdset);

    struct timeval tv;
    NSInteger timeoutInt = [timeoutMs integerValue];
    tv.tv_sec = timeoutInt / 1000;
    tv.tv_usec = (timeoutInt % 1000) * 1000;

    ret = select(sockfd + 1, NULL, &fdset, NULL, &tv);
    if (ret > 0) {
      int so_error;
      socklen_t len = sizeof(so_error);
      getsockopt(sockfd, SOL_SOCKET, SO_ERROR, &so_error, &len);
      close(sockfd);
      if (so_error == 0) {
        resolve(@YES);  // ✅ Kết nối thành công
      } else {
        resolve(@NO);   // ❌ Kết nối thất bại
      }
    } else {
      close(sockfd);
      resolve(@NO);     // ❌ Timeout hoặc lỗi khác
    }
  });
}

// Phương thức kết nối đến máy in qua TCP, nhận IP và cổng từ tham số
RCT_EXPORT_METHOD(connectToPrinter:(NSString *)host port:(NSInteger)port) {
  // Kiểm tra xem host có hợp lệ không
  if (host == nil || host.length == 0) {
    RCTLogError(@"Invalid host IP provided.");
    return;
  }
  
  // Tạo cặp luồng để kết nối đến máy in
  CFReadStreamRef readStream;
  CFWriteStreamRef writeStream;
  
  // Tạo cặp stream để kết nối tới máy in
  CFStreamCreatePairWithSocketToHost(NULL, (__bridge CFStringRef)host, (UInt32)port, &readStream, &writeStream);
  
  // Chuyển đổi đối tượng CFReadStreamRef và CFWriteStreamRef thành NSInputStream và NSOutputStream
  self.inputStream = (__bridge_transfer NSInputStream *)readStream;
  self.outputStream = (__bridge_transfer NSOutputStream *)writeStream;
  
  // Mở luồng
  [self.outputStream open];
  [self.inputStream open];
  
  RCTLogInfo(@"Connected to printer at %@:%ld", host, (long)port);
}

//RCT_EXPORT_METHOD(send:(NSString *)message resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject) {
//  if (self.outputStream) {
//    NSString *messageWithEnd = [message stringByAppendingString:@"\r\n"];
//    
//    NSData *data = [messageWithEnd dataUsingEncoding:NSUTF8StringEncoding];
//    
//    NSInteger bytesWritten = [self.outputStream write:[data bytes] maxLength:[data length]];
//    
//    if (bytesWritten == [data length]) {
//      resolve(@"Message sent successfully");
//    } else {
//      reject(@"SEND_ERROR", @"Failed to send message", nil);
//    }
//  } else {
//    reject(@"NO_CONNECTION", @"No connection established", nil);
//  }
//}

// Phương thức đóng kết nối
RCT_EXPORT_METHOD(closeConnection) {
  if (self.outputStream) {
    [self.outputStream close];
    [self.inputStream close];
    self.outputStream = nil;
    self.inputStream = nil;
    RCTLogInfo(@"Connection closed");
  }
}

RCT_EXPORT_METHOD(printLabel:(NSDictionary *) options withResolve:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject) {
  NSInteger width = [[options valueForKey:@"width"] integerValue];
  NSInteger height = [[options valueForKey:@"height"] integerValue];
  NSInteger gap = [[options valueForKey:@"gap"] integerValue];
  NSInteger home = [[options valueForKey:@"home"] integerValue];
  NSString *tear = [options valueForKey:@"tear"];
  if(!tear || ![@"ON" isEqualToString:tear]) tear = @"OFF";
  NSArray *texts = [options objectForKey:@"text"];
  NSArray *qrCodes = [options objectForKey:@"qrcode"];
  NSArray *barCodes = [options objectForKey:@"barcode"];
  NSArray *images = [options objectForKey:@"image"];
  NSArray *reverses = [options objectForKey:@"revers"];
  NSInteger direction = [[options valueForKey:@"direction"] integerValue];
  NSInteger density = [[options valueForKey:@"density"] integerValue];
  NSArray* reference = [options objectForKey:@"reference"];
  NSInteger sound = [[options valueForKey:@"sound"] integerValue];
  NSInteger speed = [[options valueForKey:@"speed"] integerValue];
  MyTscCommand *tsc = [[MyTscCommand alloc] init];
  if(speed){
      [tsc addSpeed:[tsc findSpeedValue:speed]];
  }
  if(density){
      [tsc addDensity:density];
  }
  [tsc addSize:width height:height];
  [tsc addGap:gap];
  [tsc addDirection:direction];
  if(reference && [reference count] ==2){
      NSInteger x = [[reference objectAtIndex:0] integerValue];
      NSInteger y = [[reference objectAtIndex:1] integerValue];
      NSLog(@"refernce  %ld y:%ld ",x,y);
      [tsc addReference:x y:y];
  }else{
      [tsc addReference:0 y:0];
  }
  [tsc addTear:tear];
  if(home && home == 1){
    [tsc addBackFeed:16];
    [tsc addHome];
  }
  [tsc addCls];
  //Add Texts
  for(int i=0; texts && i<[texts count];i++){
      NSDictionary * text = [texts objectAtIndex:i];
      NSString *t = [text valueForKey:@"text"];
      NSInteger x = [[text valueForKey:@"x"] integerValue];
      NSInteger y = [[text valueForKey:@"y"] integerValue];
      NSString *fontType = [text valueForKey:@"fonttype"];
      NSInteger rotation = [[text valueForKey:@"rotation"] integerValue];
      NSInteger xscal = [[text valueForKey:@"xscal"] integerValue];
      NSInteger yscal = [[text valueForKey:@"yscal"] integerValue];
      Boolean bold = [[text valueForKey:@"bold"] boolValue];

      [tsc addText:x y:y fontType:fontType rotation:rotation xscal:xscal yscal:yscal text:t];
      if(bold){
          [tsc addText:x+1 y:y fontType:fontType
              rotation:rotation xscal:xscal yscal:yscal  text:t];
          [tsc addText:x y:y+1 fontType:fontType
              rotation:rotation xscal:xscal yscal:yscal  text:t];
      }
  }
  for (int i = 0; images && i < [images count]; i++) {
      NSDictionary *img = [images objectAtIndex:i];
      NSInteger x = [[img valueForKey:@"x"] integerValue];
      NSInteger y = [[img valueForKey:@"y"] integerValue];
      NSInteger imgWidth = [[img valueForKey:@"width"] integerValue];
      NSInteger mode = [[img valueForKey:@"mode"] integerValue];
      NSString *image  = [img valueForKey:@"image"];
      NSData *imageData = [[NSData alloc] initWithBase64EncodedString:image options:0];
      UIImage *uiImage = [[UIImage alloc] initWithData:imageData];
      [tsc addStrToCommand:@""];
      [tsc addBitmap:x y:y bitmapMode:mode width:imgWidth bitmap:uiImage];
      NSLog(@"### IMAGE %@", uiImage);
  }
  [tsc addPrint:1 n:1];
  if (sound) {
      [tsc addSound:2 interval:100];
  }
 
  // Ghi dữ liệu từ NSMutableData vào NSOutputStream
  NSData *dataToSend = tsc.command;
  NSString *base64String = [dataToSend base64EncodedStringWithOptions:0];
  NSInteger bytesWritten = [self.outputStream write:[dataToSend bytes] maxLength:[dataToSend length]];

  // Kiểm tra xem dữ liệu có được ghi thành công không
  if (bytesWritten == [dataToSend length]) {
    resolve(@"In thành công!!!");
  } else {
    reject(@"SEND_ERROR", @"In thất bại!!!", nil);
  }
}

@end
