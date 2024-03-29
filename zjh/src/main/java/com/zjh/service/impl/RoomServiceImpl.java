package com.zjh.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.zjh.entity.Room;
import com.zjh.mapper.RoomMapper;
import com.zjh.service.IRoomService;
import org.springframework.stereotype.Service;

/**
 * 房间
 */
@Service
public class RoomServiceImpl extends ServiceImpl<RoomMapper, Room> implements IRoomService {

}
