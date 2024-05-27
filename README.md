娱乐地址:http://8.142.156.127

| 待优化清单                 | 进度  |
|-----------------------|-----|
| 增加退出登录功能              | 已完成 |
| 开牌的排序功能(降序)           | 已完成 |
| 当对局过程只剩两人时,有人退出时,直接获胜 | 已完成 |
| 比牌默认显示下拉的第一个人         | 已完成 |
| 下注信息改为最大20            | 已完成 |
| 最后两位玩家时直接比牌跳过选人       | 已完成 |
| 踢人功能                  | 已完成 |
| 对局已经开始无法加入            | 已完成 |
| 看牌后刷新页面会丢牌            | 已完成 |
| 存在3人以上比牌输了后给个提示       | 已完成 |
| 房主不需要准备,应该为开始         | 已完成 |
| 相同用户名不能重复登录           | 已完成 |
| 挤账号功能                 | 已完成 |
| 房间群聊功能                |     |
| 房间语音功能                |     |
| 类似斗地主的语音包功能           |     |
| 玩家退出对局后 得分榜应该保留玩家信息   | ing |
| 样式优化,适配手机端            |     |
| 增加计时器,默认20s,不操作则视为弃牌  |     |

# 功能截图

![image-20240527085236420](https://wxy-md.oss-cn-shanghai.aliyuncs.com/image-20240527085236420.png)

![image-20240527123359475](https://wxy-md.oss-cn-shanghai.aliyuncs.com/image-20240527123359475.png)

![image-20240527123530858](https://wxy-md.oss-cn-shanghai.aliyuncs.com/image-20240527123530858.png)

![image-20240527123554289](https://wxy-md.oss-cn-shanghai.aliyuncs.com/image-20240527123554289.png)

![image-20240527123627572](https://wxy-md.oss-cn-shanghai.aliyuncs.com/image-20240527123627572.png)

# Nginx部署配置

```conf
    server {
        listen       80;
        server_name  lcoalhost;
        location /api/ {
            proxy_set_header Host $http_host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header REMOTE-HOST $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_pass http://8.142.156.127:3001;
        }

        location /socket.io/ {
            rewrite ^/wsUrl/(.*)$ /$1 break;
            proxy_pass  http://8.142.156.127:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }

        location / {
           root 	/usr/share/nginx/html/zjh;
           try_files $uri $uri/ /index.html;
           index  index.html;
        }
    }
```



