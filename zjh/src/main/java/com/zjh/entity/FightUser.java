package com.zjh.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.annotations.ApiModel;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;


@Data
@TableName("fight_user")
@ApiModel(value = "对局用户表")
public class FightUser implements Serializable {

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
     * 用户id
     */
    private Long userId;

    /**
     * 准备状态 1未准备 2准备
     */
    private Boolean prepareStatus;

    /**
     * 是否看牌 1未看牌 2已看牌 3甩牌
     */
    private Boolean lookStatus;

    /**
     * 牌号
     */
    private String number;

    /**
     * 上注金额
     */
    private BigDecimal amount;

    /**
     * 喜钱
     */
    private BigDecimal happyAmount;

    /**
     * 加入时间
     */
    private LocalDateTime currentTime;

    /**
     * 逻辑删除字段 YES/NO
     */
    private String available;
}
