#import "RNEscNetPrinterRaw.h"
#import <React/RCTBridgeModule.h>

@interface RNEscNetPrinter (RawBridgeMethods)
- (void)init:(RCTResponseSenderBlock)successCallback
        fail:(RCTResponseSenderBlock)errorCallback;
- (void)setConnectionMode:(NSString *)mode
                  success:(RCTResponseSenderBlock)successCallback
                     fail:(RCTResponseSenderBlock)errorCallback;
- (void)getDeviceList:(RCTResponseSenderBlock)successCallback
                 fail:(RCTResponseSenderBlock)errorCallback;
- (void)connectPrinter:(NSString *)host
              withPort:(nonnull NSNumber *)port
               success:(RCTResponseSenderBlock)successCallback
                  fail:(RCTResponseSenderBlock)errorCallback;
- (void)printRawData:(NSString *)text
      printerOptions:(NSDictionary *)options
                fail:(RCTResponseSenderBlock)errorCallback;
- (void)printImageData:(NSString *)imgUrl
        printerOptions:(NSDictionary *)options
                  fail:(RCTResponseSenderBlock)errorCallback;
- (void)printImageBase64:(NSString *)base64Qr
          printerOptions:(NSDictionary *)options
                    fail:(RCTResponseSenderBlock)errorCallback;
- (void)printBill:(NSString *)text
   printerOptions:(NSDictionary *)options
             fail:(RCTResponseSenderBlock)errorCallback;
- (void)printText:(NSString *)text
   printerOptions:(NSDictionary *)options
             fail:(RCTResponseSenderBlock)errorCallback;
- (void)printRaw:(NSString *)base64Data
            fail:(RCTResponseSenderBlock)errorCallback;
- (void)sendHex:(NSString *)hex
           fail:(RCTResponseSenderBlock)errorCallback;
- (void)closeConn;
@end

@implementation RNEscNetPrinterRaw

RCT_EXPORT_MODULE()

RCT_EXPORT_METHOD(init:(RCTResponseSenderBlock)successCallback
                  fail:(RCTResponseSenderBlock)errorCallback)
{
    [super init:successCallback fail:errorCallback];
    [super setConnectionMode:@"rawSocket" success:^(NSArray *response) {} fail:^(NSArray *error) {}];
}

RCT_EXPORT_METHOD(setConnectionMode:(NSString *)mode
                  success:(RCTResponseSenderBlock)successCallback
                  fail:(RCTResponseSenderBlock)errorCallback)
{
    [super setConnectionMode:@"rawSocket" success:successCallback fail:errorCallback];
}

RCT_EXPORT_METHOD(getDeviceList:(RCTResponseSenderBlock)successCallback
                  fail:(RCTResponseSenderBlock)errorCallback)
{
    [super getDeviceList:successCallback fail:errorCallback];
}

RCT_EXPORT_METHOD(connectPrinter:(NSString *)host
                  withPort:(nonnull NSNumber *)port
                  success:(RCTResponseSenderBlock)successCallback
                  fail:(RCTResponseSenderBlock)errorCallback)
{
    [super connectPrinter:host withPort:port success:successCallback fail:errorCallback];
}

RCT_EXPORT_METHOD(printRawData:(NSString *)text
                  printerOptions:(NSDictionary *)options
                  fail:(RCTResponseSenderBlock)errorCallback)
{
    [super printRawData:text printerOptions:options fail:errorCallback];
}

RCT_EXPORT_METHOD(printImageData:(NSString *)imgUrl
                  printerOptions:(NSDictionary *)options
                  fail:(RCTResponseSenderBlock)errorCallback)
{
    [super printImageData:imgUrl printerOptions:options fail:errorCallback];
}

RCT_EXPORT_METHOD(printImageBase64:(NSString *)base64Qr
                  printerOptions:(NSDictionary *)options
                  fail:(RCTResponseSenderBlock)errorCallback)
{
    [super printImageBase64:base64Qr printerOptions:options fail:errorCallback];
}

RCT_EXPORT_METHOD(printBill:(NSString *)text
                  printerOptions:(NSDictionary *)options
                  fail:(RCTResponseSenderBlock)errorCallback)
{
    [super printBill:text printerOptions:options fail:errorCallback];
}

RCT_EXPORT_METHOD(printText:(NSString *)text
                  printerOptions:(NSDictionary *)options
                  fail:(RCTResponseSenderBlock)errorCallback)
{
    [super printText:text printerOptions:options fail:errorCallback];
}

RCT_EXPORT_METHOD(printRaw:(NSString *)base64Data
                  fail:(RCTResponseSenderBlock)errorCallback)
{
    [super printRaw:base64Data fail:errorCallback];
}

RCT_EXPORT_METHOD(sendHex:(NSString *)hex
                  fail:(RCTResponseSenderBlock)errorCallback)
{
    [super sendHex:hex fail:errorCallback];
}

RCT_EXPORT_METHOD(closeConn)
{
    [super closeConn];
}

@end
