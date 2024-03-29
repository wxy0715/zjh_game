package com.zjh.util;

import io.netty.channel.Channel;
import io.netty.util.Attribute;
import io.netty.util.AttributeKey;


public class NettyAttrUtil {

    private static final AttributeKey<String> ATTR_KEY_LAST_HEARTBEAT_TIME = AttributeKey.valueOf("lastHeartBeatTime");

    private static final AttributeKey<String> ATTR_KEY_USER_ID = AttributeKey.valueOf("userId");
    
    /**
     * 刷新心跳时间
     */
    public static void refreshLastHeartBeatTime(Channel channel) {
    	long now = System.currentTimeMillis();
        channel.attr(ATTR_KEY_LAST_HEARTBEAT_TIME).set(Long.toString(now));
    }

    /**
     * 获取最后一次心跳时间
     */
    public static Long getLastHeartBeatTime(Channel channel) {
        String value = getAttribute(channel, ATTR_KEY_LAST_HEARTBEAT_TIME);
        if (value != null) {
            return Long.valueOf(value);
        }
        return null;
    }

    /**
     * 设置用户id
     */
    public static void setUserId(Channel channel, String value) {
        channel.attr(ATTR_KEY_USER_ID).set(value);
    }

    /**
     * 获取用户id
     */
    public static String getUserId(Channel channel) {
        return getAttribute(channel, ATTR_KEY_USER_ID);
    }

    /**
     * 获取属性
     */
    private static String getAttribute(Channel channel, AttributeKey<String> key) {
        Attribute<String> attr = channel.attr(key);
        return attr.get();
    }
}
