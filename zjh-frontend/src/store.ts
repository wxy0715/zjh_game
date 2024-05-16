import { createStore } from 'ice';
import user from './models/user';
import room from './models/room';

const store = createStore({
  user,
  room,
});

export default store;
