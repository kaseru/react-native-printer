package com.xgitvn.printer.tsc;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.util.Base64;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

import java.util.Vector;

import com.xgitvn.printer.tsc.bluetooth.TscCommand;

public class PrintUtils {
    public static byte[] getPrinterData(final ReadableMap options){
        int width = options.getInt("width");
        int height = options.getInt("height");
        int gap = options.hasKey("gap") ? options.getInt("gap") : 0;
        ReadableArray texts = options.hasKey("text")? options.getArray("text"):null;
        ReadableArray qrCodes = options.hasKey("qrcode")? options.getArray("qrcode"):null;
        ReadableArray barCodes = options.hasKey("barcode")? options.getArray("barcode"):null;
        ReadableArray images = options.hasKey("image")? options.getArray("image"):null;
        ReadableArray reverses = options.hasKey("reverse")? options.getArray("reverse"):null;

        TscCommand.DIRECTION direction = options.hasKey("direction") ?
                TscCommand.DIRECTION.BACKWARD.getValue() == options.getInt("direction") ? TscCommand.DIRECTION.BACKWARD : TscCommand.DIRECTION.FORWARD
                : TscCommand.DIRECTION.FORWARD;
        ReadableArray reference = options.hasKey("reference")?options.getArray("reference"):null;

        boolean sound = false;
        if (options.hasKey("sound") && options.getInt("sound") == 1) {
            sound = true;
        }
        boolean home = false;
        if(options.hasKey("home") && options.getInt("home")== 1){
            home = true;
        }
        TscCommand tsc = new TscCommand();
        tsc.addSize(width,height); //设置标签尺寸，按照实际尺寸设置
        tsc.addGap(gap);           //设置标签间隙，按照实际尺寸设置，如果为无间隙纸则设置为0
        tsc.addDirection(direction);//设置打印方向
        //设置原点坐标
        if (reference != null && reference.size() == 2) {
            tsc.addReference(reference.getInt(0), reference.getInt(1));
        } else {
            tsc.addReference(0, 0);
        }
        if(home) {
            tsc.addBackFeed(16);
            tsc.addHome();//走纸到开始位置
        }
        tsc.addCls();// 清除打印缓冲区

        for (int i = 0;texts!=null&& i < texts.size(); i++) {
            ReadableMap text = texts.getMap(i);
            String t = text.getString("text");
            int x = text.getInt("x");
            int y = text.getInt("y");
            TscCommand.FONTTYPE fonttype = PrintUtils.findFontType(text.getString("fonttype"));
            TscCommand.ROTATION rotation = PrintUtils.findRotation(text.getInt("rotation"));
            TscCommand.FONTMUL xscal = PrintUtils.findFontMul(text.getInt("xscal"));
            TscCommand.FONTMUL yscal = PrintUtils.findFontMul(text.getInt("xscal"));
            boolean bold = text.hasKey("bold") && text.getBoolean("bold");

            try {
                byte[] temp = t.getBytes("UTF-8");
                String temStr = new String(temp, "UTF-8");
                t = new String(temStr.getBytes("GB2312"), "GB2312");//打印的文字
            } catch (Exception e) {
                // promise.reject("INVALID_TEXT", e);
                // return;
            }

            tsc.addText(x, y, fonttype/*字体类型*/,
                    rotation/*旋转角度*/, xscal/*横向放大*/, yscal/*纵向放大*/, t);

            if(bold){
                tsc.addText(x+1, y, fonttype,
                        rotation, xscal, yscal, t/*这里的t可能需要替换成同等长度的空格*/);
                tsc.addText(x, y+1, fonttype,
                        rotation, xscal, yscal, t/*这里的t可能需要替换成同等长度的空格*/);
            }
        }

        //绘制图片
        if(images != null){
            for (int i = 0; i < images.size(); i++) {
                ReadableMap img = images.getMap(i);
                int x = img.getInt("x");
                int y = img.getInt("y");
                int imgWidth = img.getInt("width");
                TscCommand.BITMAP_MODE mode = TscCommand.BITMAP_MODE.OVERWRITE;
                String image  = img.getString("image");
                byte[] decoded = Base64.decode(image, Base64.DEFAULT);
                Bitmap b = BitmapFactory.decodeByteArray(decoded, 0, decoded.length);
                tsc.addBitmap(x,y, mode, imgWidth,b);
            }
        }


        tsc.addPrint(1, 1); // 打印标签
        if (sound) {
            tsc.addSound(2, 100); //打印标签后 蜂鸣器响
        }
        Vector<Byte> bytes = tsc.getCommand();
        byte[] dataToSend = new byte[bytes.size()];
        for(int i=0;i<bytes.size();i++){
            dataToSend[i]= bytes.get(i);
        }
        return dataToSend;
    }

    public static TscCommand.FONTMUL findFontMul(int scan) {
        TscCommand.FONTMUL mul = TscCommand.FONTMUL.MUL_1;
        for (TscCommand.FONTMUL m : TscCommand.FONTMUL.values()) {
            if (m.getValue() == scan) {
                mul = m;
                break;
            }
        }
        return mul;
    }

    public static TscCommand.ROTATION findRotation(int rotation) {
        TscCommand.ROTATION rt = TscCommand.ROTATION.ROTATION_0;
        for (TscCommand.ROTATION r : TscCommand.ROTATION.values()) {
            if (r.getValue() == rotation) {
                rt = r;
                break;
            }
        }
        return rt;
    }

    public static TscCommand.FONTTYPE findFontType(String fonttype) {
        TscCommand.FONTTYPE ft = TscCommand.FONTTYPE.FONT_CHINESE;
        for (TscCommand.FONTTYPE f : TscCommand.FONTTYPE.values()) {
            if ((""+f.getValue()).equalsIgnoreCase(fonttype)) {
                ft = f;
                break;
            }
        }
        return ft;
    }

    public TscCommand.BITMAP_MODE findBitmapMode(int mode){
        TscCommand.BITMAP_MODE bm = TscCommand.BITMAP_MODE.OVERWRITE;
        for (TscCommand.BITMAP_MODE m : TscCommand.BITMAP_MODE.values()) {
            if (m.getValue() == mode) {
                bm = m;
                break;
            }
        }
        return bm;
    }
}
