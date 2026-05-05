

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface RNNetEscPrinter : RCTEventEmitter <RCTBridgeModule>{
    NSString *connected_ip;
    NSString *current_scan_ip;
    NSMutableArray* _printerArray;
    bool is_scanning;
}

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

