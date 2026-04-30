# react-native-printer

Thư viện React Native chuẩn hoá cho nhu cầu in của Kaseru.

Mục tiêu phase đầu:
- Receipt ESC/POS
- Label TSC
- Kết nối Bluetooth / Wi-Fi / USB
- Gom phần engine về 1 repo để dễ chủ động bảo trì
- Không mang business flow của app vào thư viện

## Scope hiện tại

Repo này được dựng để thay thế cách dùng rời rạc nhiều thư viện in ở app hiện tại.

Nguồn tham chiếu/chứa code nền đang dùng:
- Bluetooth ESC/POS + TSC:
  - https://github.com/kaseru/react-native-bluetooth-escpos-printer
- Wi-Fi / USB / BLE thermal printer:
  - https://github.com/thiendangit/react-native-thermal-receipt-printer-image-qr
- App đang sử dụng flow in để tham chiếu khi thiết kế abstraction:
  - aSellerV5 internal app flow

Lưu ý:
- Repo này **không copy `PrintUtils` từ app**.
- Chỉ tham chiếu flow thực tế để rút API chung.
- Sunmi hiện tại **không nằm trong scope**.

## Định hướng kiến trúc

- `src/core`: types, facade, interfaces
- `src/bluetooth`: adapter cho Bluetooth ESC/POS + TSC
- `src/network`: adapter cho NetPrinter / Wi-Fi
- `src/usb`: adapter cho USB printer
- `src/legacy`: nơi chứa lớp bọc tương thích từ các thư viện gốc

## Phase 1

Ưu tiên:
- Bluetooth ESC/POS
- Bluetooth TSC
- Wi-Fi ESC/POS
- USB ESC/POS
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

## TODO

- [ ] Import code nền Bluetooth từ repo Kaseru
- [ ] Import code nền Net/USB/BLE từ repo thermal
- [ ] Chuẩn hoá TypeScript types
- [ ] Thiết kế facade API chung
- [ ] Thêm example app / sample usage
- [ ] Thêm docs migrate từ app cũ
