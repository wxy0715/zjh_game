package com.zjh.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.annotations.ApiModel;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;
@Data
@TableName("user_user_recharge")
@ApiModel(value = "充值表")
public class UserUserRecharge implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
    private Long id;

    /**
     * 用户id
     */
    private Long userId;

    /**
     * 余额
     */
    private BigDecimal canUseAmount;

    /**
     * 充值方式
     */
    private String securityAmount;

    /**
     * 逻辑删除字段 YES/NO
     */
    private String available;
}
