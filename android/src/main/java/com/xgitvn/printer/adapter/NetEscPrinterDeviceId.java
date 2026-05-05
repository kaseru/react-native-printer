package com.xgitvn.printer.adapter;

/**
 * Created by xiesubin on 2017/9/21.
 */

public class NetEscPrinterDeviceId extends PrinterDeviceId {
    private String host;
    private Integer port;


    public static NetEscPrinterDeviceId valueOf(String host, Integer port) {
        return new NetEscPrinterDeviceId(host, port);
    }

    private NetEscPrinterDeviceId(String host, Integer port) {
        this.host = host;
        this.port = port;
    }

    public String getHost() {
        return host;
    }

    public Integer getPort() {
        return port;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        if (!super.equals(o)) return false;

        NetEscPrinterDeviceId that = (NetEscPrinterDeviceId) o;

        if (!host.equals(that.host)) return false;
        return port.equals(that.port);
    }

    @Override
    public int hashCode() {
        int result = host.hashCode();
        result = 31 * result + port.hashCode();
        return result;
    }
}
