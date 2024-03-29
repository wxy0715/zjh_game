package com.zjh.service.impl;

import cn.dev33.satoken.stp.StpUtil;
import cn.dev33.satoken.util.SaResult;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zjh.entity.User;
import com.zjh.mapper.UserMapper;
import com.zjh.service.IUserService;
import com.zjh.util.ExceptionUtil;
import org.springframework.stereotype.Service;

/**
 * 用户
 */
@Service
public class UserServiceImpl extends ServiceImpl<UserMapper, User> implements IUserService {
    @Override
    public SaResult login(User user) {
        ExceptionUtil.isNull(user.getName(), "用户名不能为空");
        ExceptionUtil.isNull(user.getPwd(), "密码不能为空");
        LambdaQueryWrapper<User> userLambdaQueryWrapper = new LambdaQueryWrapper<>();
        userLambdaQueryWrapper.eq(User::getName, user.getName());
        userLambdaQueryWrapper.eq(User::getPwd, user.getPwd());
        User user1 = getOne(userLambdaQueryWrapper);
        if (user1 != null) {
            StpUtil.login(user1.getId());
            return SaResult.ok("登录成功");
        }
        return SaResult.error("登录失败");
    }


    @Override
    public SaResult register(User user) {
        ExceptionUtil.isNull(user.getName(), "用户名不能为空");
        ExceptionUtil.isNull(user.getPwd(), "密码不能为空");
        // 用户名不能重复
        if (getOne(new LambdaQueryWrapper<User>().eq(User::getName, user.getName())) != null) {
            return SaResult.error("用户名已存在");
        }
        // 保存到数据库
        save(user);
        return SaResult.ok("注册成功");
    }


}
