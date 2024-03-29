package com.zjh.netty.handle;

import com.alibaba.fastjson.JSONObject;
import com.zjh.netty.constant.MessageCodeConstant;
import com.zjh.netty.constant.MessageTypeConstant;
import com.zjh.netty.constant.WebSocketConstant;
import com.zjh.netty.session.SessionHolder;
import com.zjh.netty.session.WebSocketSessionService;
import com.zjh.util.ExceptionUtil;
import com.zjh.util.NettyAttrUtil;
import com.zjh.util.RequestParamUtil;
import com.zjh.util.WsMessage;
import com.zjh.util.date.DateTool;
import com.zjh.util.date.enums.DateStyle;
import io.netty.buffer.ByteBuf;
import io.netty.buffer.Unpooled;
import io.netty.channel.*;
import io.netty.handler.codec.http.DefaultFullHttpResponse;
import io.netty.handler.codec.http.FullHttpRequest;
import io.netty.handler.codec.http.HttpResponseStatus;
import io.netty.handler.codec.http.HttpVersion;
import io.netty.handler.codec.http.websocketx.*;
import io.netty.util.CharsetUtil;
import lombok.extern.slf4j.Slf4j;

import java.util.*;


/**
 * Netty ChannelHandler，用来处理客户端和服务端的会话生命周期事件（握手、建立连接、断开连接、收消息等）
 * 接收请求，接收 WebSocket 信息的控制类
 */
@Slf4j
public class WebSocketChannelInboundHandler extends SimpleChannelInboundHandler<Object> {

    // WebSocket 握手工厂类
    private final WebSocketServerHandshakerFactory factory = new WebSocketServerHandshakerFactory(WebSocketConstant.WEB_SOCKET_URL, null, false);
    // 握手
    private WebSocketServerHandshaker webSocketServerHandshaker;
    // session管理
    private final WebSocketSessionService webSocketSessionService = new WebSocketSessionService();

    /**
     * 服务端处理客户端websocket请求的核心方法
     */
    @Override
    protected void channelRead0(ChannelHandlerContext channelHandlerContext, Object obj) throws Exception {
        if (obj instanceof FullHttpRequest) {
            log.info("处理客户端向服务端发起 http 请求的业务");
            handHttpRequest(channelHandlerContext, (FullHttpRequest) obj);
            return;
        }
        if (obj instanceof WebSocketFrame) {
            log.info("处理客户端与服务端之间的 websocket 业务");
            handWebsocketFrame(channelHandlerContext, (WebSocketFrame) obj);
        }
    }

    /**
     * 客户端与服务端创建连接的时候调用
     */
    @Override
    public void channelActive(ChannelHandlerContext ctx) throws Exception {
        //创建新的 WebSocket 连接，保存当前 channel
        log.info("————客户端与服务端连接开启————");
        // 设置高水位
        //ctx.channel().config().setWriteBufferHighWaterMark();
        // 设置低水位
        //ctx.channel().config().setWriteBufferLowWaterMark();
    }

    /**
     * 客户端与服务端断开连接的时候调用
     */
    @Override
    public void channelInactive(ChannelHandlerContext ctx) throws Exception {
        log.info("————客户端与服务端连接断开————");
        webSocketSessionService.clearSession(ctx.channel());
    }

    /**
     * 服务端接收客户端发送过来的数据结束之后调用
     */
    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) throws Exception {
        log.info("————服务端读取结束————");
        ctx.flush();
    }

    /**
     * 工程出现异常的时候调用
     */
    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) throws Exception {
        log.error("exceptionCaught异常:", cause);
        ctx.close();
    }

    /**
     * 处理客户端与服务端之间的 websocket 业务
     */
    private void handWebsocketFrame(ChannelHandlerContext ctx, WebSocketFrame frame) {
        // 判断是否是关闭 websocket 的指令
        if (frame instanceof CloseWebSocketFrame) {
            //关闭握手
            webSocketServerHandshaker.close(ctx.channel(), (CloseWebSocketFrame) frame.retain());
            webSocketSessionService.clearSession(ctx.channel());
            return;
        }
        // 判断是否是ping消息
        if (frame instanceof PingWebSocketFrame) {
            ctx.channel().write(new PongWebSocketFrame(frame.content().retain()));
            return;
        }
        // 判断是否Pong消息
        if (frame instanceof PongWebSocketFrame) {
            ctx.writeAndFlush(new PongWebSocketFrame(frame.content().retain()));
            return;
        }
        // 判断是否是二进制消息，如果是二进制消息，抛出异常
        if (!(frame instanceof TextWebSocketFrame)) {
            log.error("目前我们不支持二进制消息");
            ctx.channel().write(new PongWebSocketFrame(frame.content().retain()));
            ExceptionUtil.error("【" + this.getClass().getName() + "】不支持消息");
        }
        // 获取并解析客户端向服务端发送的 json 消息
        String message = ((TextWebSocketFrame) frame).text();
        log.info("服务端获取到消息：{}", message);
        JSONObject json = JSONObject.parseObject(message);
        try {
            String uuid = UUID.randomUUID().toString();
            String time = DateTool.dateToString(new Date(), DateStyle.YYYY_MM_DD_HH_MM_SS.getValue());
            json.put("id", uuid);
            json.put("sendTime", time);
            int code = json.getIntValue("code");
            switch (code) {
                // 群聊
                case MessageCodeConstant.GROUP_CHAT_CODE:
                    //向连接上来的客户端广播消息
                    SessionHolder.channelGroup.writeAndFlush(new TextWebSocketFrame(JSONObject.toJSONString(json)));
                    break;
                // 私聊
                case MessageCodeConstant.PRIVATE_CHAT_CODE:
                    // 接收人id
                    String receiveUserId = json.getString("receiverUserId");
                    String sendUserId = json.getString("sendUserId");
                    String msg = JSONObject.toJSONString(json);
                    // 点对点挨个给接收人发送消息
                    for (Map.Entry<String, Channel> entry : SessionHolder.channelMap.entrySet()) {
                        String userId = entry.getKey();
                        Channel channel = entry.getValue();
                        if (receiveUserId.equals(userId)) {
                            channel.writeAndFlush(new TextWebSocketFrame(msg));
                        }
                    }
                    // 如果发给别人，给自己也发一条
                    if (!receiveUserId.equals(sendUserId)) {
                        SessionHolder.channelMap.get(sendUserId).writeAndFlush(new TextWebSocketFrame(msg));
                    }
                    break;
                //向连接上来的客户端广播消息
                case MessageCodeConstant.SYSTEM_MESSAGE_CODE:
                    SessionHolder.channelGroup.writeAndFlush(new TextWebSocketFrame(JSONObject.toJSONString(json)));
                    break;
                // 心跳
                case MessageCodeConstant.PONG_CHAT_CODE:
                    Channel channel = ctx.channel();
                    // 更新心跳时间
                    NettyAttrUtil.refreshLastHeartBeatTime(channel);
                default:
            }
        } catch(Exception e) {
            log.error("转发消息异常:", e);
            ExceptionUtil.error(e.getMessage());
        }
    }

    /**
     * 处理客户端向服务端发起 http 握手请求的业务
     * WebSocket在建立握手时，数据是通过HTTP传输的。但是建立之后，在真正传输时候是不需要HTTP协议的。
     * WebSocket 连接过程：
     * 首先，客户端发起http请求，经过3次握手后，建立起TCP连接；http请求里存放WebSocket支持的版本号等信息，如：Upgrade、Connection、WebSocket-Version等；
     * 然后，服务器收到客户端的握手请求后，同样采用HTTP协议回馈数据；
     * 最后，客户端收到连接成功的消息后，开始借助于TCP传输信道进行全双工通信。
     */
    private void handHttpRequest(ChannelHandlerContext ctx, FullHttpRequest request) {
        // 如果请求失败或者该请求不是客户端向服务端发起的 http 请求，则响应错误信息
        if (!request.decoderResult().isSuccess()
                || !("websocket".equals(request.headers().get("Upgrade")))) {
            // code ：400
            sendHttpResponse(ctx, new DefaultFullHttpResponse(HttpVersion.HTTP_1_1, HttpResponseStatus.BAD_REQUEST));
            return;
        }
        //新建一个握手
        webSocketServerHandshaker = factory.newHandshaker(request);
        if (webSocketServerHandshaker == null) {
            //如果为空，返回响应：不受支持的 websocket 版本
            WebSocketServerHandshakerFactory.sendUnsupportedVersionResponse(ctx.channel());
        } else {
            //否则，执行握手
            Map<String, String> params = RequestParamUtil.urlSplit(request.uri());
            String userId = params.get("userId");
            Channel channel = ctx.channel();
            NettyAttrUtil.setUserId(channel, userId);
            NettyAttrUtil.refreshLastHeartBeatTime(channel);
            webSocketServerHandshaker.handshake(ctx.channel(), request);
        	SessionHolder.channelGroup.add(ctx.channel());
        	SessionHolder.channelMap.put(userId, ctx.channel());
            log.info("握手成功，客户端请求uri：{}", request.uri());
        	
        	// 推送用户上线消息，更新客户端在线用户列表
        	Set<String> userList = SessionHolder.channelMap.keySet();
        	WsMessage msg = new WsMessage();
        	Map<String, Object> ext = new HashMap<>();
        	ext.put("userList", userList);
        	msg.setExt(ext);
        	msg.setCode(MessageCodeConstant.SYSTEM_MESSAGE_CODE);
        	msg.setType(MessageTypeConstant.UPDATE_USERLIST_SYSTEM_MESSGAE);
        	SessionHolder.channelGroup.writeAndFlush(new TextWebSocketFrame(JSONObject.toJSONString(msg)));
        }
    }


    /**
     * 服务端向客户端响应消息
     */
    private void sendHttpResponse(ChannelHandlerContext ctx, DefaultFullHttpResponse response) {
        if (response.status().code() != 200) {
            //创建源缓冲区
            ByteBuf byteBuf = Unpooled.copiedBuffer(response.status().toString(), CharsetUtil.UTF_8);
            //将源缓冲区的数据传送到此缓冲区
            response.content().writeBytes(byteBuf);
            //释放源缓冲区
            byteBuf.release();
        }
        //写入请求，服务端向客户端发送数据
        ChannelFuture channelFuture = ctx.channel().writeAndFlush(response);
        if (response.status().code() != 200) {
        	// 如果请求失败，关闭 ChannelFuture
            channelFuture.addListener(ChannelFutureListener.CLOSE);
        }
    }

}
