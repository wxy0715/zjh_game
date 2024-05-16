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

socket.on('leaveRoom', () => {
  message.warn('房主已解散房间');
  history!.replace('/');
});

socket.on('backToRoom', ({ id, roomInfo }) => {
  roomDispatchers.setRoomInfo(roomInfo);
  history!.push(`/room?id=${id}`);
});
