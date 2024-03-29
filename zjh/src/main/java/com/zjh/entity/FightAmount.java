package com.zjh.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.annotations.ApiModel;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@TableName("fight_amount")
@ApiModel(value = "结算表")
public class FightAmount implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
    private Long id;

    /**
     * 房间id
     */
    private Long roomId;

    /**
     * 对局id
     */
    private Long fightId;

    /**
     * 对局状态 1进行中 2结束
     */
    private Boolean fightStatus;

    /**
     * 赢家用户id
     */
    private Long userId;

    /**
     * 赢家牌号
     */
    private String number;

    /**
     * 金额
     */
    private BigDecimal amount;

    /**
     * 喜钱
     */
    private BigDecimal happyAmount;

    /**
     * 逻辑删除字段 YES/NO
     */
    private String available;
}
