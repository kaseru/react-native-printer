
#import <React/RCTBridgeModule.h>
#import "BluetoothPrinter.h";

@interface EscBluetoothPrinter : NSObject <RCTBridgeModule, WriteDataToBleDelegate>

@property (nonatomic,assign) NSInteger deviceWidth;
-(void) textPrint:(NSString *) text
       inEncoding:(NSString *) encoding
     withCodePage:(NSInteger) codePage
       widthTimes:(NSInteger) widthTimes
      heightTimes:(NSInteger) heightTimes
         fontType:(NSInteger) fontType
         delegate:(NSObject<WriteDataToBleDelegate> *) delegate;
@end
  
