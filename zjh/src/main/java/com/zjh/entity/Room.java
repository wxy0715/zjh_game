package com.zjh.entity;

import com.baomidou.mybatisplus.annotation.TableId;
import io.swagger.annotations.ApiModel;
import lombok.Data;

import java.io.Serializable;

@Data
@ApiModel(value = "房间表")
public class Room implements Serializable {

    private static final long serialVersionUID = 1L;

    @TableId(value = "id")
    private Long id;

    /**
     * 房主
     */
    private Long userId;

    /**
     * 房间号
     */
    private String name;

    /**
     * 房间密码，默认不设置
     */
    private String pwd;

    /**
     * 租户ID
     */
    private String tenantId;

    /**
     * 逻辑删除字段 YES/NO
     */
    private String available;
}
