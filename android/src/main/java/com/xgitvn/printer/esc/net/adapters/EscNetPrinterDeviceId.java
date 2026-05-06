package com.xgitvn.printer.esc.net.adapters;
import com.xgitvn.printer.esc.adapters.core.PrinterDeviceId;

/**
 * Created by xiesubin on 2017/9/21.
 */

public class EscNetPrinterDeviceId extends PrinterDeviceId {
    private String host;
    private Integer port;


    public static EscNetPrinterDeviceId valueOf(String host, Integer port) {
        return new EscNetPrinterDeviceId(host, port);
    }

    private EscNetPrinterDeviceId(String host, Integer port) {
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

        EscNetPrinterDeviceId that = (EscNetPrinterDeviceId) o;

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
