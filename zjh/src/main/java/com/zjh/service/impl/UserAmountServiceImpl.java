package com.zjh.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zjh.entity.UserAmount;
import com.zjh.mapper.UserAmountMapper;
import com.zjh.service.IUserAmountService;
import org.springframework.stereotype.Service;

/**
 * 用户筹码
 */
@Service
public class UserAmountServiceImpl extends ServiceImpl<UserAmountMapper, UserAmount> implements IUserAmountService {

}
