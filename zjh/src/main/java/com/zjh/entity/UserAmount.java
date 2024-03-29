package com.zjh.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.annotations.ApiModel;
import lombok.Data;

import java.io.Serializable;
import java.math.BigDecimal;

@Data
@TableName("user_amount")
@ApiModel(value = "用户筹码表")
public class UserAmount implements Serializable {

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
     * 保证金
     */
    private BigDecimal securityAmount;

    /**
     * 逻辑删除字段 YES/NO
     */
    private String available;
}
