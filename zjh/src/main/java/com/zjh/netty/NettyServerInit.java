package com.zjh.netty;

import com.zjh.netty.constant.WebSocketConstant;
import com.zjh.netty.handle.WebSocketChanneInitializer;
import com.zjh.netty.session.WebSocketSessionService;
import io.netty.bootstrap.ServerBootstrap;
import io.netty.channel.ChannelFuture;
import io.netty.channel.ChannelFutureListener;
import io.netty.channel.ChannelOption;
import io.netty.channel.EventLoopGroup;
import io.netty.channel.nio.NioEventLoopGroup;
import io.netty.channel.socket.nio.NioServerSocketChannel;
import io.netty.handler.logging.LogLevel;
import io.netty.handler.logging.LoggingHandler;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.stereotype.Component;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
@Slf4j
public class NettyServerInit implements InitializingBean {
    @Override
    public void afterPropertiesSet() throws Exception {
        // 创建启动任务
        Runnable startNetty = this::startNettyServer;
        // 在新的线程中启动Netty服务器
        new Thread(startNetty).start();
    }

    /**
     * 启动netty监听程序
     */
    private void startNettyServer() {
        // 创建主线程组,用于监听连接
        EventLoopGroup bossGroup = new NioEventLoopGroup(1);
        // 创建子线程组,用于处理连接
        EventLoopGroup workerGroup = new NioEventLoopGroup();
        try {
            //创建服务器端的启动对象，配置参数
            ServerBootstrap serverBootstrap  = new ServerBootstrap();
            //使用链式编程来进行设置,设置两个线程组
            serverBootstrap.group(bossGroup,workerGroup)
                    //使用NioSocketChannel 作为服务器的通道实现
                    .channel(NioServerSocketChannel.class)
                    // 设置线程队列得到连接个数
                    .option(ChannelOption.SO_BACKLOG, 128)
                    // 设置保持活动连接状态
                    .childOption(ChannelOption.SO_KEEPALIVE, true)
                    // 该handler对应 bossGroup
                    .handler(new LoggingHandler(LogLevel.DEBUG))
                    // childHandler 对应 workerGroup
                    .childHandler(new WebSocketChanneInitializer());
            ChannelFuture channelFuture = serverBootstrap.bind(WebSocketConstant.WEB_SOCKET_PORT).sync();
            // 注册监听器
            channelFuture.addListener(new ChannelFutureListener() {
                @Override
                public void operationComplete(ChannelFuture future) throws Exception {
                    if (channelFuture.isSuccess()) {
                        log.info("监听端口{}成功", WebSocketConstant.WEB_SOCKET_PORT);
                    } else {
                        log.error("监听端口{}失败",WebSocketConstant.WEB_SOCKET_PORT);
                    }
                }
            });
            // 添加定时任务,定时检查连接是否断开
            ScheduledExecutorService executorService = Executors.newScheduledThreadPool(3);
            WebSocketSessionService webSocketInfoService = new WebSocketSessionService();
            //定时任务:扫描所有的Channel，关闭失效的Channel
            executorService.scheduleAtFixedRate(webSocketInfoService::scanNotActiveChannel,
                    3, 60, TimeUnit.SECONDS);

            // 向所有客户端发送Ping消息
            executorService.scheduleAtFixedRate(webSocketInfoService::sendPing,
                    3, 50, TimeUnit.SECONDS);
            // 没有监听到关闭事件时候,主线程不会停止
            channelFuture.channel().closeFuture().sync();
        } catch (Exception e) {
            log.error("netty启动失败",e);
        } finally {
            //退出程序
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }

    }
}
