import { useState, useEffect } from 'react';
import { Button, Modal, Input } from 'antd';
import AuthRoute from '@/components/AuthRoute';

import style from './index.module.less';
import { socket } from '@/utils/io';
import store from '@/store';

import { request } from 'ice';

interface IList {
  master: string;
  id: string;
  roomName: string;
  user: string[];
}

const Home = () => {
  const [user] = store.useModel('user');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [list, setList] = useState<IList[]>([]);
  const [inputVal, setInputVal] = useState('');
  useEffect(() => {
    if (user?.userInfo?.username) {
      socket.emit('enterHall', user.userInfo);
    }
    async function getRoomList() {
      const { data } = await request('/api/roomList');
      setList(data);
    }
    getRoomList();
  }, [user.userInfo]);
  return (
    <div className={style.hallWrapper}>
      <h2>大厅</h2>
      <div className={style.btnGroup}>
        <Button type="primary" onClick={() => setCreateModalVisible(true)}>
          创建房间
        </Button>
        <Button type="primary" onClick={() => setJoinModalVisible(true)}>
          加入房间
        </Button>
      </div>
      <div className={style.roomList}>
        {list.length > 0
          ? list.map((item) => (
              <div className={style.item} key={item.roomName}>
                <h4>
                  <span>房间名：{item.roomName}</span>
                  <span>{item.user.length}/8</span>
                </h4>
                <p>房间号：{item.id}</p>
                <Button
                  type="primary"
                  onClick={() => {
                    socket.emit('joinRoom', { id: item.id, username: user.userInfo.username });
                  }}
                >
                  加入
                </Button>
              </div>
            ))
          : '大厅暂无房间，快去创建一个吧'}
      </div>
      <Modal
        title="创建房间"
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onOk={async () => {
          socket.emit('createRoom', user.userInfo);
          setCreateModalVisible(false);
        }}
      >
        <p>是否创建房间？</p>
      </Modal>
      <Modal
        title="加入房间"
        visible={joinModalVisible}
        onCancel={() => setJoinModalVisible(false)}
        onOk={() => {
          socket.emit('joinRoom', { id: inputVal, username: user.userInfo.username });
          setJoinModalVisible(false);
        }}
      >
        <Input placeholder="请输入房间号" value={inputVal} onChange={(e) => setInputVal(e.target.value)} />
      </Modal>
    </div>
  );
};

export default AuthRoute(Home);
