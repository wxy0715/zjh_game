package com.zjh.controller;

import cn.dev33.satoken.stp.StpUtil;
import cn.dev33.satoken.util.SaResult;
import com.zjh.entity.User;
import com.zjh.service.IUserService;
import com.zjh.util.ExceptionUtil;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;

@RestController
@RequestMapping("/user")
@Api(tags = "用户")
public class UserController {
    @Resource
    private IUserService userService;

    @PostMapping("login")
    @ApiOperation(value = "登录")
    public SaResult login(@RequestBody User user) {
        return userService.login(user);
    }

    @PostMapping("register")
    @ApiOperation(value = "注册")
    public SaResult register(@RequestBody User user) {
        return userService.register(user);
    }

    @PostMapping("isLogin")
    @ApiOperation(value = "查询登录状态")
    public SaResult isLogin() {
        boolean login = StpUtil.isLogin();
        if (login) {
            return SaResult.ok();
        }
        return SaResult.error();
    }
}
