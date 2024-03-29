package com.zjh.netty.session;


import com.alibaba.fastjson.JSONObject;
import com.zjh.netty.constant.MessageCodeConstant;
import com.zjh.util.NettyAttrUtil;
import com.zjh.util.WsMessage;
import io.netty.channel.Channel;
import io.netty.handler.codec.http.websocketx.TextWebSocketFrame;
import lombok.extern.slf4j.Slf4j;


import java.util.Map;

/**
 * 定时处理掉线的channel
 * todo 移除后需要把用户退出登录
 */
@Slf4j
public class WebSocketSessionService {

    /**
     * 清除会话信息
     */
    public void clearSession(Channel channel) {
        String userId = NettyAttrUtil.getUserId(channel);
        // 清除会话信息
        SessionHolder.channelGroup.remove(channel);
        SessionHolder.channelMap.remove(userId);
    }

    /**
     * 广播 ping 信息
     */
    public void sendPing() {
        WsMessage webSocketMessage = new WsMessage();
        webSocketMessage.setCode(MessageCodeConstant.PING_MESSAGE_CODE);
        String message = JSONObject.toJSONString(webSocketMessage);
        TextWebSocketFrame tws = new TextWebSocketFrame(message);
        SessionHolder.channelGroup.writeAndFlush(tws);
    }

    /**
     * 从缓存中移除Channel，并且关闭Channel
     */
    public void scanNotActiveChannel() {
        Map<String, Channel> channelMap = SessionHolder.channelMap;
        // 如果这个直播下已经没有连接中的用户会话了，删除频道
        if (channelMap.isEmpty()) {
            return;
        }
        for (Map.Entry<String, Channel> stringChannelEntry : channelMap.entrySet()) {
            Channel channel = stringChannelEntry.getValue();
            // 获取上次心跳时间
            long lastHeartBeatTime = NettyAttrUtil.getLastHeartBeatTime(channel);
            // 获取心跳间隔时间
            long intervalMillis = (System.currentTimeMillis() - lastHeartBeatTime);
            if (!channel.isOpen() || !channel.isActive() || intervalMillis > 90000L) {
                channelMap.remove(stringChannelEntry.getKey());
                SessionHolder.channelGroup.remove(channel);
                if (channel.isOpen() || channel.isActive()) {
                    channel.close();
                }
            }
        }
    }
    
}
