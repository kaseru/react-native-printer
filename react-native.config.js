module.exports = {
  dependency: {
    platforms: {
      android: {
        packageImportPath: 'import cn.jystudio.bluetooth.RNBluetoothEscposPrinterPackage;\nimport com.pinmi.react.printer.RNPrinterPackage;',
        packageInstance: 'new RNBluetoothEscposPrinterPackage(), new RNPrinterPackage()',
      },
      ios: {},
    },
  },
};
