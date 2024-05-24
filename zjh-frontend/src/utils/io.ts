import { io } from 'socket.io-client';
import { history } from 'ice';
import { message } from 'antd';
import store from '@/store';

// eslint-disable-next-line @iceworks/best-practices/no-http-url
export const socket = io('/');
const [, roomDispatchers] = store.getModel('room');

socket.on('enterRoom', ({ id: roomId, roomInfo }) => {
  if (roomId) {
    roomDispatchers.setRoomInfo(roomInfo);
    history!.push(`/room?id=${roomId}`);
  } else {
    message.error('进入房间失败，请检查房间号是否输入正确');
  }
});

socket.on('update', (roomInfo) => {
  roomDispatchers.setRoomInfo(roomInfo);
});

socket.on('gameOver', ({ lastPokers, winner, jackpot }) => {
  message.success({
    content: `恭喜${winner}获得本局胜利，奖池为${jackpot}!`,
    duration: 8,
  });
  roomDispatchers.setLastPokers(lastPokers);
});

/**
 * 解散房间
 */
socket.on('leaveRoom', () => {
  message.warn('房主已解散房间');
  history!.replace('/');
});

/**
 * 移除房间
 */
socket.on('removeUserFromRoom', ({id,username}) => {
  if (username === store.getState().user.userInfo.username) {
    message.warn('您已被移除房间');
    // 更新别的房间用户信息
    socket.emit('removeFromRoom', { id: id, username });
    history!.replace('/');
  }
});

/**
 * 比牌失败者提示
 */
socket.on('compareLoser', ({winUserName,loserUserName}) => {
  if (loserUserName === store.getState().user.userInfo.username) {
    message.warn('您被'+winUserName+"淘汰");
  }
});

/**
 * 被挤下线通知
 */
socket.on('userDown', ({username}) => {
  if (username === store.getState().user.userInfo.username) {
    localStorage.removeItem('zjh_token');
  }
});

socket.on('backToRoom', ({ id, roomInfo }) => {
  if (!roomInfo || Object.keys(roomInfo).length === 0) {
    socket.emit('destroyRoom', { id: id });
  } else {
    roomDispatchers.setRoomInfo(roomInfo);
    history!.push(`/room?id=${id}`);
  }
});
