import { message } from 'antd';
import { runApp, IAppConfig, history } from 'ice';
import store from './store';
import { socket } from './utils/io';

const appConfig: IAppConfig = {
  app: {
    rootId: 'ice-container',
    getInitialData: (ctx) => {
      if (!ctx?.path?.includes('/login')) {
        const [, userDispatchers] = store.getModel('user');
        userDispatchers.getUserInfo();
        if (ctx?.path?.includes('/room')) {
          const id = history!.location.search.slice(1).split('=')[1];
          socket.emit('backRoom', { id, token: localStorage.getItem('zjh_token') });
        }
      }
      return Promise.resolve();
    },
  },
  router: {
    type: 'hash',
  },
  request: {
    interceptors: {
      request: {
        onConfig: (config) => {
          if (localStorage.getItem('zjh_token')) {
            config.headers.Authorization = `Bearer ${localStorage.getItem('zjh_token')}`;
          }
          return config;
        },
        onError: (error) => {
          return Promise.reject(error);
        },
      },
      response: {
        onConfig: (response) => {
          if (response.data.code !== 0 && response.data.code !== 3001) {
            message.error(response.data.msg);
            return Promise.reject(response.data.msg);
          }
          return response;
        },
        onError: (error) => {
          const {
            data: { code, msg },
          } = error.response || {};
          message.error(msg);
          if (code === 401) {
            localStorage.removeItem('zjh_token');
            history?.push('/login');
          }
          return Promise.reject(error);
        },
      },
    },
  },
};

runApp(appConfig);
