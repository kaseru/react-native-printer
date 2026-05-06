#ifndef EscUSBPrinter_h
#define EscUSBPrinter_h

#if __has_include("RCTBridge.h")
#import "RCTBridge.h"
#else
#import <React/RCTBridge.h>
#endif

@interface EscUSBPrinter : NSObject <RCTBridge>

@end

#endif /* EscUSBPrinter_h */
