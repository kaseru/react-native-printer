# react-native-printer

Thư viện React Native chuẩn hoá cho nhu cầu in của Kaseru.

Mục tiêu phase đầu:
- Receipt ESC/POS
- Label TSC
- Sunmi internal printer
- Kết nối Bluetooth / Wi-Fi / USB
- Gom phần engine về 1 repo để dễ chủ động bảo trì
- Mang các native module dùng thật trong app về cùng 1 nơi

## Scope hiện tại

Repo này được dựng để thay thế cách dùng rời rạc nhiều thư viện in ở app hiện tại.

Nguồn tham chiếu/chứa code nền đang dùng:
- Bluetooth ESC/POS + TSC:
  - https://github.com/kaseru/react-native-bluetooth-escpos-printer
- Wi-Fi / USB / BLE thermal printer:
  - https://github.com/thiendangit/react-native-thermal-receipt-printer-image-qr
- Sunmi:
  - https://github.com/defcon89/react-native-sunmi-v2-printer
- App đang sử dụng flow in để tham chiếu khi thiết kế abstraction:
  - aSellerV5 internal app flow

Lưu ý:
- Repo này hiện đã mang cả các native module TSC đang dùng trong app vào thư viện.
- Các file iOS network printer đang dùng bản vá raw socket từ app.

## Định hướng kiến trúc

- `src/index.ts`: public facade và export tương thích
- `src/legacy/bluetooth`: lớp bọc Bluetooth ESC/POS + TSC
- `src/legacy/thermal`: lớp bọc Net / USB / BLE receipt
- `src/legacy/sunmi`: export Sunmi native module
- `android/`: source Android đã gom về `com.xgitvn.printer`
- `ios/`: source iOS active duy nhất

## Phase 1

Ưu tiên:
- Bluetooth ESC/POS
- Bluetooth TSC
- Wi-Fi ESC/POS
- USB ESC/POS
- Sunmi bill printing
- TSC TCP/USB native modules
- API public ổn định ở mức cơ bản:
  - `connect()`
  - `disconnect()`
  - `printText()`
  - `printImageBase64()`
  - `printReceipt()`
  - `printLabel()`
  - `cut()`
  - `openDrawer()`

## Migrate strategy

Bước đầu sẽ bọc các engine hiện có thành API thống nhất.
Sau đó mới tách tiếp renderer / capability / transport nếu cần.

## iOS source of truth

- Source iOS active hiện nằm ở `ios/`.
- `RNNetPrinter.m` trong `ios/` là bản đã vá để hỗ trợ `rawSocket`.

## TODO

- [x] Import code nền Bluetooth từ repo Kaseru
- [x] Import code nền Net/USB/BLE từ repo thermal
- [x] Import Sunmi module
- [x] Import TSC native module từ app
- [x] Chuẩn hoá namespace Android về `com.xgitvn.printer`
- [ ] Chuẩn hoá TypeScript types
- [ ] Thiết kế facade API chung
- [ ] Thêm example app / sample usage
- [ ] Thêm docs migrate từ app cũ
