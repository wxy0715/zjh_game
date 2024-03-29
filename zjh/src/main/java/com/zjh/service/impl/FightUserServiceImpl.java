package com.zjh.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zjh.entity.FightUser;
import com.zjh.mapper.FightUserMapper;
import com.zjh.service.IFightUserService;
import org.springframework.stereotype.Service;

/**
 * 对局用户
 */
@Service
public class FightUserServiceImpl extends ServiceImpl<FightUserMapper, FightUser> implements IFightUserService {

}
