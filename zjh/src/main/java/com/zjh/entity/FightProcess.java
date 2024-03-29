package com.zjh.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.annotations.ApiModel;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;


@Data
@TableName("fight_process")
@ApiModel(value = "对局表")
public class FightProcess implements Serializable {

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
     * 说话用户
     */
    private Long talkUserId;

    /**
     * 底注金额
     */
    private BigDecimal securityAmount;

    /**
     * 创建时间
     */
    private LocalDateTime currentTime;

    /**
     * 逻辑删除字段 YES/NO
     */
    private String available;
}
