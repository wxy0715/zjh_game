interface IRoomInfo {
  master: string;
  roomName: string;
  user: any[];
  id: string;
  start: boolean;
  playerIdx: number;
  base: number;
}
interface ILastPokers {
  type: string;
  num: number;
}
export default {
  state: {
    roomInfo: {},
    lastPokers: [],
  },
  reducers: {
    update(prevState, payload) {
      return {
        ...prevState,
        ...payload,
      };
    },
  },

  effects: (dispatch) => ({
    setRoomInfo(roomInfo: IRoomInfo) {
      dispatch.room.update({
        roomInfo,
      });
    },
    setLastPokers(lastPokers: ILastPokers[]) {
      dispatch.room.update({
        lastPokers,
      });
    },
  }),
};
