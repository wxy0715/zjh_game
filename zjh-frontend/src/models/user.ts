import { request } from 'ice';

interface IUserInfo {
  username?: string;
  token?: string;
}

export default {
  state: {
    userInfo: {
      username: '',
      token: '',
    },
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
    async getUserInfo() {
      const userInfo: IUserInfo = await request('/api/userInfo');
      dispatch.user.update({
        userInfo,
      });
    },
  }),
};
