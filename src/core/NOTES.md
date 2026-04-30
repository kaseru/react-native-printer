This package intentionally does not copy app-level helpers like PrintUtils.

Current approach:
- study production flow from aSellerV5
- import/own lower-level printer engines
- build a clean public API on top

References:
- https://github.com/kaseru/react-native-bluetooth-escpos-printer
- https://github.com/thiendangit/react-native-thermal-receipt-printer-image-qr
