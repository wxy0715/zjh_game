package com.zjh.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zjh.entity.FightAmount;
import com.zjh.mapper.FightAmountMapper;
import com.zjh.service.IFightAmountService;
import org.springframework.stereotype.Service;

/**
 * 结算
 */
@Service
public class FightAmountServiceImpl extends ServiceImpl<FightAmountMapper, FightAmount> implements IFightAmountService {

}
