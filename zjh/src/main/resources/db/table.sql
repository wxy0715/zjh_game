CREATE TABLE IF NOT EXISTS `user` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `name` varchar(45) NOT NULL COMMENT '用户名',
    `pwd` varchar(45) NOT NULL COMMENT '密码',
    `available` VARCHAR(3) NOT NULL default 'YES' comment '逻辑删除字段 YES/NO',
    PRIMARY KEY (`id`)
) comment '用户表' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `user_amount` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `user_id` bigint NOT NULL COMMENT '用户id',
    `can_use_amount` decimal(25,2) NOT NULL COMMENT '余额',
    `security_amount` decimal(25,2) NOT NULL COMMENT '保证金',
    `available` VARCHAR(3) NOT NULL default 'YES' comment '逻辑删除字段 YES/NO',
    PRIMARY KEY (`id`)
) comment '用户筹码表' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `user_user_recharge` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `user_id` bigint NOT NULL COMMENT '用户id',
    `can_use_amount` decimal(25,2) NOT NULL COMMENT '余额',
    `security_amount` VARCHAR(10) NOT NULL COMMENT '充值方式',
    `available` VARCHAR(3) NOT NULL default 'YES' comment '逻辑删除字段 YES/NO',
    PRIMARY KEY (`id`)
) comment '充值表' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `room` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `user_id` bigint NOT NULL COMMENT '房主',
    `name` varchar(45) NOT NULL COMMENT '房间号',
    `pwd` varchar(45) NOT NULL COMMENT '房间密码，默认不设置',
    `tenant_id` varchar(100) default NULL COMMENT '租户ID',
    `available` VARCHAR(3) NOT NULL default 'YES' comment '逻辑删除字段 YES/NO',
    PRIMARY KEY (`id`)
) comment '房间表' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `fight_user`(
    `id` bigint NOT NULL AUTO_INCREMENT,
    `room_id` bigint NOT NULL COMMENT '房间id',
    `fight_id` bigint NOT NULL COMMENT '对局id',
    `user_id` bigint NOT NULL COMMENT '用户id',
    `prepare_status` tinyint(1) NOT NULL COMMENT '准备状态 1未准备 2准备',
    `look_status` tinyint(1) NOT NULL COMMENT '是否看牌 1未看牌 2已看牌 3甩牌',
    `number` CHAR(3) NOT NULL COMMENT '牌号',
    `amount` decimal(25,2) NOT NULL COMMENT '上注金额',
    `happy_amount` decimal(25,2) NOT NULL COMMENT '喜钱',
    `current_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP  COMMENT '加入时间',
    `available` VARCHAR(3) NOT NULL default 'YES' comment '逻辑删除字段 YES/NO',
    PRIMARY KEY (`id`)
) comment '对局用户表' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `fight_process`(
    `id` bigint NOT NULL AUTO_INCREMENT,
    `room_id` bigint NOT NULL COMMENT '房间id',
    `fight_id` bigint NOT NULL COMMENT '对局id',
    `talk_user_id` bigint NOT NULL COMMENT '说话用户',
    `security_amount` decimal(25,2) NOT NULL COMMENT '底注金额',
    `current_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP  COMMENT '创建时间',
    `available` VARCHAR(3) NOT NULL default 'YES' comment '逻辑删除字段 YES/NO',
    PRIMARY KEY (`id`)
) comment '对局表' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `fight_amount` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `room_id` bigint NOT NULL COMMENT '房间id',
    `fight_id` bigint NOT NULL COMMENT '对局id',
    `fight_status` tinyint(1) NOT NULL COMMENT '对局状态 1进行中 2结束',
    `user_id` bigint NOT NULL COMMENT '赢家用户id',
    `number` CHAR(3) NOT NULL COMMENT '赢家牌号',
    `amount` decimal(25,2) NOT NULL COMMENT '金额',
    `happy_amount` decimal(25,2) NOT NULL COMMENT '喜钱',
    `available` VARCHAR(3) NOT NULL default 'YES' comment '逻辑删除字段 YES/NO',
    PRIMARY KEY (`id`)
) comment '结算表' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `fight_amount` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `room_id` bigint NOT NULL COMMENT '房间id',
    `fight_id` bigint NOT NULL COMMENT '对局id',
    `buy_user_id` bigint NOT NULL COMMENT '买方用户id',
    `sell_user_id` bigint NOT NULL COMMENT '卖方用户id',
    `buy_number` CHAR(3) NOT NULL COMMENT '买方牌号',
    `sell_number` CHAR(3) NOT NULL COMMENT '卖方牌号',
    `amount` decimal(25,2) NOT NULL COMMENT '金额',
    `happy_amount` decimal(25,4) NOT NULL COMMENT '喜钱',
    `available` VARCHAR(3) NOT NULL default 'YES' comment '逻辑删除字段 YES/NO',
    PRIMARY KEY (`id`)
) comment '买牌表' ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;