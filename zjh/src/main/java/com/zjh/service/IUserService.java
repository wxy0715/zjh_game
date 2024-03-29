package com.zjh.service;

import cn.dev33.satoken.util.SaResult;
import com.baomidou.mybatisplus.extension.service.IService;
import com.zjh.entity.User;

/**
 * 用户
 */
public interface IUserService extends IService<User> {

    SaResult register(User user);

    SaResult login(User user);
}
