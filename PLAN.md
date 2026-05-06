# Printer Discovery Refactor Plan

- [x] Xac dinh API hien tai cho Bluetooth, Net, USB trong `src/printer/index.ts`
- [x] Xac dinh event scanning mang LAN/WiFi (`scannerRunning`, `scannerResolved`, `registerError`)
- [ ] Dua logic callback Promise chung cho bluetooth/net/usb vao helper de tai su dung
- [ ] Doi ten ham theo huong de hieu hon, giu backward compatibility
- [ ] Bo sung flow tim thiet bi Bluetooth o tang TypeScript
- [ ] Bo sung flow tim may in WiFi/LAN o tang TypeScript
- [ ] Kiem tra export de dam bao app cu van chay

## Dinh huong ten ham

- `getDeviceList` -> `getDevices`
- `connectPrinter` -> `connect`
- `scanDevices` (bluetooth native) -> `searchDevices`
- Tim may in mang: `searchPrinters`

## Ghi chu tuong thich

- Giu lai ham cu (`getDeviceList`, `connectPrinter`) nhu alias de tranh breaking change.
- Them ham moi song song de de migrate.
