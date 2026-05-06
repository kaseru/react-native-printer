//
//  EscNetPrinter.m
//  Patched for raw TCP socket printing on iOS to avoid PrinterSDK connectIP side effects.
//

#import "EscNetPrinter.h"
#include <ifaddrs.h>
#include <arpa/inet.h>
#import <CoreFoundation/CoreFoundation.h>
#import <Foundation/Foundation.h>
#import <React/RCTLog.h>
#import <UIKit/UIKit.h>

static NSString *const EVENT_SCANNER_RESOLVED = @"scannerResolved";
static NSString *const EVENT_SCANNER_RUNNING = @"scannerRunning";

static const NSInteger kPrinterConnectTimeoutMs = 3000;
static const NSInteger kPrinterWriteChunkSize = 4096;

@interface PrivateIPHelper : NSObject
@end

@implementation PrivateIPHelper

- (NSString *)getIPAddress {
    NSString *address = @"error";
    struct ifaddrs *interfaces = NULL;
    struct ifaddrs *temp_addr = NULL;
    int success = getifaddrs(&interfaces);
    if (success == 0) {
        temp_addr = interfaces;
        while (temp_addr != NULL) {
            if (temp_addr->ifa_addr && temp_addr->ifa_addr->sa_family == AF_INET) {
                if ([[NSString stringWithUTF8String:temp_addr->ifa_name] isEqualToString:@"en0"]) {
                    address = [NSString stringWithUTF8String:inet_ntoa(((struct sockaddr_in *)temp_addr->ifa_addr)->sin_addr)];
                }
            }
            temp_addr = temp_addr->ifa_next;
        }
    }
    freeifaddrs(interfaces);
    return address;
}

@end

@interface EscNetPrinter () <NSStreamDelegate>
@property (nonatomic, strong) NSInputStream *inputStream;
@property (nonatomic, strong) NSOutputStream *outputStream;
@property (nonatomic, copy) NSString *connectedHost;
@property (nonatomic, strong) NSNumber *connectedPort;
@end

@implementation EscNetPrinter

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

RCT_EXPORT_MODULE()

- (NSArray<NSString *> *)supportedEvents
{
    return @[EVENT_SCANNER_RESOLVED, EVENT_SCANNER_RUNNING];
}

- (void)cleanupStreams
{
    if (self.inputStream) {
        self.inputStream.delegate = nil;
        [self.inputStream close];
        self.inputStream = nil;
    }

    if (self.outputStream) {
        self.outputStream.delegate = nil;
        [self.outputStream close];
        self.outputStream = nil;
    }

    connected_ip = nil;
    self.connectedHost = nil;
    self.connectedPort = nil;
} 

- (BOOL)isConnected
{
    return self.outputStream != nil && self.outputStream.streamStatus == NSStreamStatusOpen && connected_ip != nil;
}

- (BOOL)openSocketToHost:(NSString *)host port:(NSNumber *)port error:(NSError **)error
{
    [self cleanupStreams];

    CFReadStreamRef readStream = NULL;
    CFWriteStreamRef writeStream = NULL;
    CFStreamCreatePairWithSocketToHost(NULL, (__bridge CFStringRef)host, [port intValue], &readStream, &writeStream);

    if (!readStream || !writeStream) {
        if (error) {
            *error = [NSError errorWithDomain:@"EscNetPrinter" code:500 userInfo:@{NSLocalizedDescriptionKey: @"Cannot create socket streams"}];
        }
        if (readStream) CFRelease(readStream);
        if (writeStream) CFRelease(writeStream);
        return NO;
    }

    self.inputStream = CFBridgingRelease(readStream);
    self.outputStream = CFBridgingRelease(writeStream);

    self.inputStream.delegate = self;
    self.outputStream.delegate = self;

    [self.inputStream scheduleInRunLoop:[NSRunLoop mainRunLoop] forMode:NSDefaultRunLoopMode];
    [self.outputStream scheduleInRunLoop:[NSRunLoop mainRunLoop] forMode:NSDefaultRunLoopMode];

    [self.inputStream open];
    [self.outputStream open];

    NSDate *deadline = [NSDate dateWithTimeIntervalSinceNow:(kPrinterConnectTimeoutMs / 1000.0)];
    while ([deadline timeIntervalSinceNow] > 0) {
        NSStreamStatus status = self.outputStream.streamStatus;
        if (status == NSStreamStatusOpen) {
            connected_ip = host;
            self.connectedHost = host;
            self.connectedPort = port;
            return YES;
        }

        if (status == NSStreamStatusError || status == NSStreamStatusClosed) {
            NSError *streamError = self.outputStream.streamError ?: self.inputStream.streamError;
            if (error) {
                *error = streamError ?: [NSError errorWithDomain:@"EscNetPrinter" code:501 userInfo:@{NSLocalizedDescriptionKey: @"Cannot open printer socket"}];
            }
            [self cleanupStreams];
            return NO;
        }

        [[NSRunLoop mainRunLoop] runMode:NSDefaultRunLoopMode beforeDate:[NSDate dateWithTimeIntervalSinceNow:0.05]];
    }

    if (error) {
        *error = [NSError errorWithDomain:@"EscNetPrinter" code:408 userInfo:@{NSLocalizedDescriptionKey: @"Printer socket connect timeout"}];
    }
    [self cleanupStreams];
    return NO;
}

- (BOOL)writeData:(NSData *)data error:(NSError **)error
{
    if (![self isConnected]) {
        if (error) {
            *error = [NSError errorWithDomain:@"EscNetPrinter" code:503 userInfo:@{NSLocalizedDescriptionKey: @"Printer is not connected"}];
        }
        return NO;
    }

    const uint8_t *buffer = (const uint8_t *)data.bytes;
    NSInteger totalLength = data.length;
    NSInteger totalWritten = 0;

    while (totalWritten < totalLength) {
        if (self.outputStream.streamStatus != NSStreamStatusOpen) {
            if (error) {
                *error = self.outputStream.streamError ?: [NSError errorWithDomain:@"EscNetPrinter" code:504 userInfo:@{NSLocalizedDescriptionKey: @"Printer output stream is closed"}];
            }
            return NO;
        }

        if (![self.outputStream hasSpaceAvailable]) {
            [[NSRunLoop mainRunLoop] runMode:NSDefaultRunLoopMode beforeDate:[NSDate dateWithTimeIntervalSinceNow:0.02]];
            continue;
        }

        NSInteger chunk = MIN(kPrinterWriteChunkSize, totalLength - totalWritten);
        NSInteger written = [self.outputStream write:&buffer[totalWritten] maxLength:chunk];
        if (written < 0) {
            if (error) {
                *error = self.outputStream.streamError ?: [NSError errorWithDomain:@"EscNetPrinter" code:505 userInfo:@{NSLocalizedDescriptionKey: @"Cannot write to printer"}];
            }
            return NO;
        }
        if (written == 0) {
            [[NSRunLoop mainRunLoop] runMode:NSDefaultRunLoopMode beforeDate:[NSDate dateWithTimeIntervalSinceNow:0.02]];
            continue;
        }

        totalWritten += written;
    }

    return YES;
}

- (NSData *)dataForHexString:(NSString *)hexString
{
    NSString *clean = [[hexString stringByReplacingOccurrencesOfString:@" " withString:@""]
                       stringByReplacingOccurrencesOfString:@"\n" withString:@""];
    clean = [clean stringByReplacingOccurrencesOfString:@"\r" withString:@""];

    NSMutableData *data = [NSMutableData data];
    NSInteger length = clean.length;
    for (NSInteger i = 0; i + 1 < length; i += 2) {
        NSString *byteString = [clean substringWithRange:NSMakeRange(i, 2)];
        unsigned int value = 0;
        [[NSScanner scannerWithString:byteString] scanHexInt:&value];
        uint8_t byte = (uint8_t)value;
        [data appendBytes:&byte length:1];
    }
    return data;
}

- (NSData *)escposDataForText:(NSString *)text
{
    NSData *encoded = [text dataUsingEncoding:NSUTF8StringEncoding allowLossyConversion:YES];
    return encoded ?: [NSData data];
}

- (BOOL)containsEscPosControlCharacters:(NSString *)text
{
    if (text == nil || text.length == 0) return NO;
    for (NSUInteger i = 0; i < text.length; i++) {
        unichar ch = [text characterAtIndex:i];
        if (ch == 0x1B || ch == 0x1D || ch == 0x10) return YES;
    }
    return NO;
}

- (NSData *)escposDataForCut
{
    const uint8_t bytes[] = {0x1D, 0x56, 0x41, 0x00};
    return [NSData dataWithBytes:bytes length:sizeof(bytes)];
}

- (UIImage *)resizeImage:(UIImage *)image width:(CGFloat)newWidth height:(CGFloat)newHeight
{
    CGSize newSize = CGSizeMake(newWidth, newHeight);
    UIGraphicsBeginImageContextWithOptions(newSize, YES, 1.0);
    CGContextRef context = UIGraphicsGetCurrentContext();
    CGContextSetFillColorWithColor(context, [UIColor whiteColor].CGColor);
    CGContextFillRect(context, CGRectMake(0, 0, newSize.width, newSize.height));
    CGContextSetInterpolationQuality(context, kCGInterpolationHigh);
    [image drawInRect:CGRectMake(0, 0, newWidth, newHeight)];
    UIImage *newImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return newImage;
}

- (UIImage *)addImagePadding:(UIImage *)image paddingX:(CGFloat)paddingX paddingY:(CGFloat)paddingY
{
    CGFloat width = image.size.width + paddingX;
    CGFloat height = image.size.height + paddingY;

    UIGraphicsBeginImageContextWithOptions(CGSizeMake(width, height), YES, 1.0);
    CGContextRef context = UIGraphicsGetCurrentContext();
    CGContextSetFillColorWithColor(context, [UIColor whiteColor].CGColor);
    CGContextFillRect(context, CGRectMake(0, 0, width, height));
    CGFloat originX = (width - image.size.width) / 2.0;
    CGFloat originY = (height - image.size.height) / 2.0;
    [image drawInRect:CGRectMake(originX, originY, image.size.width, image.size.height)];
    UIImage *paddedImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return paddedImage;
}

- (UIImage *)getPrintImage:(UIImage *)image printerOptions:(NSDictionary *)options
{
    NSNumber *nWidth = [options valueForKey:@"imageWidth"];
    NSNumber *nHeight = [options valueForKey:@"imageHeight"];
    NSNumber *nPaddingX = [options valueForKey:@"paddingX"];

    CGFloat newWidth = nWidth != nil ? [nWidth floatValue] : 150;
    CGFloat newHeight = nHeight != nil ? [nHeight floatValue] : image.size.height;
    CGFloat paddingX = nPaddingX != nil ? [nPaddingX floatValue] : 250;

    UIImage *resizedImage = [self resizeImage:image width:newWidth height:newHeight];
    return [self addImagePadding:resizedImage paddingX:paddingX paddingY:0];
}

- (BOOL)shouldPrintPixelR:(uint8_t)r g:(uint8_t)g b:(uint8_t)b a:(uint8_t)a
{
    if (a != 0xFF) {
        return NO;
    }
    NSInteger luminance = (NSInteger)(0.299 * r + 0.587 * g + 0.114 * b);
    return luminance < 127;
}

- (NSData *)escposBitImageDataForImage:(UIImage *)image
{
    CGImageRef cgImage = image.CGImage;
    if (!cgImage) return nil;

    size_t width = CGImageGetWidth(cgImage);
    size_t height = CGImageGetHeight(cgImage);
    size_t bytesPerPixel = 4;
    size_t bytesPerRow = bytesPerPixel * width;
    size_t bitsPerComponent = 8;

    CGColorSpaceRef colorSpace = CGColorSpaceCreateDeviceRGB();
    uint8_t *rawData = (uint8_t *)calloc(height * bytesPerRow, sizeof(uint8_t));
    CGContextRef context = CGBitmapContextCreate(rawData,
                                                 width,
                                                 height,
                                                 bitsPerComponent,
                                                 bytesPerRow,
                                                 colorSpace,
                                                 kCGImageAlphaPremultipliedLast | kCGBitmapByteOrder32Big);
    CGColorSpaceRelease(colorSpace);

    if (!context || !rawData) {
        if (context) CGContextRelease(context);
        if (rawData) free(rawData);
        return nil;
    }

    CGContextSetFillColorWithColor(context, [UIColor whiteColor].CGColor);
    CGContextFillRect(context, CGRectMake(0, 0, width, height));
    CGContextDrawImage(context, CGRectMake(0, 0, width, height), cgImage);
    CGContextRelease(context);

    const uint8_t setLineSpace24[] = {0x1B, 0x33, 24};
    const uint8_t centerAlign[] = {0x1B, 0x61, 0x31};
    const uint8_t setLineSpace32[] = {0x1B, 0x33, 32};
    const uint8_t lineFeed[] = {0x0A};

    NSMutableData *result = [NSMutableData data];
    [result appendBytes:setLineSpace24 length:sizeof(setLineSpace24)];
    [result appendBytes:centerAlign length:sizeof(centerAlign)];

    for (size_t y = 0; y < height; y += 24) {
        uint8_t header[] = {0x1B, 0x2A, 33, (uint8_t)(width & 0xFF), (uint8_t)((width >> 8) & 0xFF)};
        [result appendBytes:header length:sizeof(header)];

        for (size_t x = 0; x < width; x++) {
            uint8_t slices[3] = {0, 0, 0};
            for (size_t i = 0; i < 3; i++) {
                uint8_t slice = 0;
                size_t yy = y + (i * 8);
                for (size_t b = 0; b < 8; b++) {
                    size_t yyy = yy + b;
                    if (yyy >= height) {
                        continue;
                    }
                    size_t offset = (yyy * bytesPerRow) + (x * 4);
                    uint8_t r = rawData[offset + 0];
                    uint8_t g = rawData[offset + 1];
                    uint8_t bch = rawData[offset + 2];
                    uint8_t a = rawData[offset + 3];
                    BOOL dot = [self shouldPrintPixelR:r g:g b:bch a:a];
                    if (dot) {
                        slice |= (uint8_t)(1 << (7 - b));
                    }
                }
                slices[i] = slice;
            }
            [result appendBytes:slices length:3];
        }

        [result appendBytes:lineFeed length:sizeof(lineFeed)];
    }

    [result appendBytes:setLineSpace32 length:sizeof(setLineSpace32)];
    [result appendBytes:lineFeed length:sizeof(lineFeed)];

    free(rawData);
    return result;
}

- (void)stream:(NSStream *)aStream handleEvent:(NSStreamEvent)eventCode
{
    if (eventCode == NSStreamEventErrorOccurred) {
        RCTLogWarn(@"EscNetPrinter stream error: %@", aStream.streamError.localizedDescription);
    } else if (eventCode == NSStreamEventEndEncountered) {
        if (aStream == self.outputStream || aStream == self.inputStream) {
            [self cleanupStreams];
        }
    }
}

RCT_EXPORT_METHOD(init:(RCTResponseSenderBlock)successCallback
                  fail:(RCTResponseSenderBlock)errorCallback)
{
    [self cleanupStreams];
    is_scanning = NO;
    _printerArray = [NSMutableArray new];
    successCallback(@[@"Init successful"]);
}

RCT_EXPORT_METHOD(getDeviceList:(RCTResponseSenderBlock)successCallback
                  fail:(RCTResponseSenderBlock)errorCallback)
{
    dispatch_async(dispatch_get_global_queue(DISPATCH_QUEUE_PRIORITY_DEFAULT, 0), ^{
        [self scan:successCallback];
    });
}

- (void)scan:(RCTResponseSenderBlock)successCallback
{
    @try {
        PrivateIPHelper *privateIP = [[PrivateIPHelper alloc] init];
        NSString *localIP = [privateIP getIPAddress];
        is_scanning = YES;
        [self sendEventWithName:EVENT_SCANNER_RUNNING body:@YES];
        _printerArray = [NSMutableArray new];

        NSString *prefix = [localIP substringToIndex:([localIP rangeOfString:@"." options:NSBackwardsSearch].location)];
        NSInteger suffix = [[localIP substringFromIndex:([localIP rangeOfString:@"." options:NSBackwardsSearch].location)] intValue];

        for (NSInteger i = 1; i < 255; i++) {
            if (i == suffix) continue;
            NSString *testIP = [NSString stringWithFormat:@"%@.%ld", prefix, (long)i];
            NSError *probeError = nil;
            if ([self openSocketToHost:testIP port:@9100 error:&probeError]) {
                [_printerArray addObject:@{ @"host": testIP, @"port": @9100 }];
                [self cleanupStreams];
            }
        }

        NSOrderedSet *orderedSet = [NSOrderedSet orderedSetWithArray:_printerArray];
        NSArray *arrayWithoutDuplicates = [orderedSet array];
        _printerArray = (NSMutableArray *)arrayWithoutDuplicates;

        [self sendEventWithName:EVENT_SCANNER_RESOLVED body:_printerArray];
        successCallback(@[_printerArray]);
    } @catch (NSException *exception) {
        NSLog(@"No connection");
    }
    [self cleanupStreams];
    is_scanning = NO;
    [self sendEventWithName:EVENT_SCANNER_RUNNING body:@NO];
}

RCT_EXPORT_METHOD(connectPrinter:(NSString *)host
                  withPort:(nonnull NSNumber *)port
                  success:(RCTResponseSenderBlock)successCallback
                  fail:(RCTResponseSenderBlock)errorCallback)
{
    @try {
        NSError *error = nil;
        BOOL ok = [self openSocketToHost:host port:port error:&error];
        if (!ok) {
            [NSException raise:@"Invalid connection" format:@"%@", error.localizedDescription ?: [NSString stringWithFormat:@"Can't connect to printer %@", host]];
        }

        [[NSNotificationCenter defaultCenter] postNotificationName:@"EscNetPrinterConnected" object:nil];
        successCallback(@[[NSString stringWithFormat:@"Connected to printer %@:%@", host, port]]);
    } @catch (NSException *exception) {
        errorCallback(@[exception.reason]);
    }
}

RCT_EXPORT_METHOD(printRawData:(NSString *)text
                  printerOptions:(NSDictionary *)options
                  fail:(RCTResponseSenderBlock)errorCallback)
{
    @try {
        NSNumber *beepPtr = [options valueForKey:@"beep"];
        NSNumber *cutPtr = [options valueForKey:@"cut"];
        BOOL beep = (BOOL)[beepPtr intValue];
        BOOL cut = (BOOL)[cutPtr intValue];

        NSError *error = nil;
        NSData *data = [self escposDataForText:text ?: @""];
        if (![self writeData:data error:&error]) {
            [NSException raise:@"Write failed" format:@"%@", error.localizedDescription ?: @"Cannot write raw text to printer"];
        }
        if (beep) {
            const uint8_t beepBytes[] = {0x1B, 0x42, 0x03, 0x02};
            [self writeData:[NSData dataWithBytes:beepBytes length:sizeof(beepBytes)] error:nil];
        }
        if (cut) {
            [self writeData:[self escposDataForCut] error:nil];
        }
    } @catch (NSException *exception) {
        errorCallback(@[exception.reason]);
    }
}

RCT_EXPORT_METHOD(printImageData:(NSString *)imgUrl
                  printerOptions:(NSDictionary *)options
                  fail:(RCTResponseSenderBlock)errorCallback)
{
    @try {
        if (!connected_ip) {
            [NSException raise:@"Invalid connection" format:@"Can't connect to printer"];
        }

        NSURL *url = [NSURL URLWithString:imgUrl];
        NSData *imageData = [NSData dataWithContentsOfURL:url];
        if (!imageData) return;

        UIImage *image = [UIImage imageWithData:imageData];
        UIImage *printImage = [self getPrintImage:image printerOptions:options];

        NSData *imageBytes = [self escposBitImageDataForImage:printImage];
        NSError *error = nil;
        if (imageBytes && ![self writeData:imageBytes error:&error]) {
            [NSException raise:@"Write failed" format:@"%@", error.localizedDescription ?: @"Cannot write image to printer"];
        }
    } @catch (NSException *exception) {
        errorCallback(@[exception.reason]);
    }
}

RCT_EXPORT_METHOD(printImageBase64:(NSString *)base64Qr
                  printerOptions:(NSDictionary *)options
                  fail:(RCTResponseSenderBlock)errorCallback)
{
    @try {
        if (!connected_ip) {
            [NSException raise:@"Invalid connection" format:@"Can't connect to printer"];
        }
        if ([base64Qr isEqual:@""]) {
            return;
        }

        NSData *imageData = [[NSData alloc] initWithBase64EncodedString:base64Qr options:NSDataBase64DecodingIgnoreUnknownCharacters];
        if (!imageData) {
            NSString *result = [@"data:image/png;base64," stringByAppendingString:base64Qr];
            NSURL *url = [NSURL URLWithString:result];
            imageData = [NSData dataWithContentsOfURL:url];
        }
        if (!imageData) {
            [NSException raise:@"Invalid image" format:@"Cannot decode image data"];
        }

        UIImage *image = [UIImage imageWithData:imageData];
        UIImage *printImage = [self getPrintImage:image printerOptions:options];

        NSData *imageBytes = [self escposBitImageDataForImage:printImage];
        NSError *error = nil;
        if (imageBytes && ![self writeData:imageBytes error:&error]) {
            [NSException raise:@"Write failed" format:@"%@", error.localizedDescription ?: @"Cannot write image to printer"];
        }
    } @catch (NSException *exception) {
        errorCallback(@[exception.reason]);
    }
}

RCT_EXPORT_METHOD(printBill:(NSString *)text
                  printerOptions:(NSDictionary *)options
                  fail:(RCTResponseSenderBlock)errorCallback)
{
    @try {
        NSMutableData *data = [NSMutableData data];
        if (text != nil && text.length > 0) {
            [data appendData:[self escposDataForText:text]];
        }
        [data appendData:[self escposDataForCut]];

        NSError *error = nil;
        if (![self writeData:data error:&error]) {
            [NSException raise:@"Write failed" format:@"%@", error.localizedDescription ?: @"Cannot write bill data to printer"];
        }
    } @catch (NSException *exception) {
        errorCallback(@[exception.reason]);
    }
}

RCT_EXPORT_METHOD(printText:(NSString *)text
                  printerOptions:(NSDictionary *)options
                  fail:(RCTResponseSenderBlock)errorCallback)
{
    [self printRawData:text printerOptions:options fail:errorCallback];
}

RCT_EXPORT_METHOD(printRaw:(NSString *)base64Data
                  fail:(RCTResponseSenderBlock)errorCallback)
{
    @try {
        NSData *data = [[NSData alloc] initWithBase64EncodedString:base64Data options:NSDataBase64DecodingIgnoreUnknownCharacters];
        if (!data) {
            [NSException raise:@"Invalid raw data" format:@"Cannot decode base64 raw data"];
        }

        NSError *error = nil;
        if (![self writeData:data error:&error]) {
            [NSException raise:@"Write failed" format:@"%@", error.localizedDescription ?: @"Cannot write raw bytes to printer"];
        }
    } @catch (NSException *exception) {
        errorCallback(@[exception.reason]);
    }
}

RCT_EXPORT_METHOD(sendHex:(NSString *)hex
                  fail:(RCTResponseSenderBlock)errorCallback)
{
    @try {
        NSData *data = [self dataForHexString:hex ?: @""];
        NSError *error = nil;
        if (![self writeData:data error:&error]) {
            [NSException raise:@"Write failed" format:@"%@", error.localizedDescription ?: @"Cannot write hex data to printer"];
        }
    } @catch (NSException *exception) {
        errorCallback(@[exception.reason]);
    }
}

RCT_EXPORT_METHOD(closeConn)
{
    @try {
        [self cleanupStreams];
    } @catch (NSException *exception) {
        NSLog(@"%@", exception.reason);
    }
}

@end
