import AuthRoute from '@/components/AuthRoute';
import cn from 'classnames';
import style from './index.module.less';
import { Button, message, Modal, Radio, Select } from 'antd';
import type { RadioChangeEvent } from 'antd';

import store from '@/store';
import { socket } from '@/utils/io';
import { useEffect, useState } from 'react';

import { useRequest } from 'ice';
import { formatPoker } from '@/utils/formatPoker';

import ScoreList from './components/ScoreList';

export interface IUser {
  name: string;
  ready: boolean;
  pokerData?: any[];
  watched: boolean;
  point: number;
  allPoint: number;
  giveUp: boolean;
  currBase: number;
  out: boolean;
}

interface IRoomInfo {
  master: string;
  roomName: string;
  user: IUser[];
  id: string;
  start: boolean;
  playerIdx: number;
  base: number;
  times: number;
}

const maxFillNum = 10; // 最好偶数

function Room({ history }) {
  const [room] = store.useModel('room');
  const [userModel] = store.useModel('user');

  const [visible, setVisible] = useState(false);
  const [fillModalVisible, setFillModalVisible] = useState(false);
  const [fillList, setFillList] = useState<number[]>([]);
  const [currBase, setCurrBase] = useState();
  const [compareModalVisible, setCompareModalVisible] = useState(false);
  const [comparePlayerList, setComparePlayerList] = useState<any>();
  const [comparePlayer, setComparePlayer] = useState('');
  const [poker, setPoker] = useState<any>();

  const { username } = userModel.userInfo;
  const {
    master,
    roomName,
    user: users = [],
    id: roomId,
    start = false,
    playerIdx = 0,
    base,
  } = room.roomInfo as IRoomInfo;
  const selfIndex = users.findIndex((item) => item.name === username);

  const getJackpot = () => {
    let total = 0;
    users.forEach((item) => {
      total += item.point;
    });
    return Math.abs(total);
  };

  const { request: watchPoker } = useRequest(() => ({
    url: '/api/watchPoker',
    data: {
      id: roomId,
      username,
    },
    method: 'POST',
  }));

  const getStyle = (idx) => {
    return {
      transform: `rotate(${45 * (selfIndex - idx) - 180}deg)`,
    };
  };

  useEffect(() => {
    if (start) {
      if (username === users[playerIdx].name && !users[playerIdx].watched) {
        setVisible(true);
      }
      const list = users.filter((item) => !item.giveUp && !item.out && item.name !== username).map((item) => item.name);
      setComparePlayerList(list);
    }
  }, [start, playerIdx, username, users]);

  useEffect(() => {
    const list: number[] = [];
    if (users[playerIdx]) {
      if (users[playerIdx].watched) {
        for (let i = base; i <= maxFillNum; i++) {
          list.push(i);
        }
      } else {
        for (let i = Math.ceil(base / 2); i <= maxFillNum / 2; i++) {
          list.push(i);
        }
      }
      setFillList(list);
    }
  }, [base, playerIdx, users]);

  const btnGroupContent = (item: IUser) => {
    return (
      <>
        {users[playerIdx].name === username ? (
          <div className={style.btnGroup}>
            <Button
              type="primary"
              size="small"
              disabled={item.giveUp}
              onClick={() => {
                setFillModalVisible(true);
              }}
            >
              加注
            </Button>
            <Button
              type="primary"
              size="small"
              disabled={item.giveUp || Math.abs(item.point) <= 1}
              onClick={() => {
                setComparePlayer('');
                setCompareModalVisible(true);
              }}
            >
              比牌
            </Button>
            <Button
              type="primary"
              disabled={item.giveUp}
              size="small"
              onClick={() => {
                socket.emit('giveUp', { id: roomId, username });
              }}
            >
              弃牌
            </Button>
          </div>
        ) : (
          <p>考虑中...请等待...</p>
        )}
      </>
    );
  };

  const pokerListContent = (pokers) => {
    return (
      <div className={style.pokerGroup}>
        {pokers.map((k, idx) => {
          return (
            // eslint-disable-next-line react/no-array-index-key
            <div className={cn(style.poker, { [style.pokerRed]: k.type === 'H' || k.type === 'D' })} key={idx}>
              <span className={style.type}>{k.ft}</span>
              <span className={style.number}>{k.fn}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const pokerContent = (item: IUser, index: number) => {
    if (!item.ready) {
      return (
        <>
          <p>待准备...</p>
          {!start && room.lastPokers.length > 0 && pokerListContent(formatPoker(room.lastPokers[index]))}
          {item.name === username && (
            <div style={{ marginTop: 10, marginBottom: 10 }}>
              <Button
                type="primary"
                onClick={() => {
                  socket.emit('ready', { id: roomId, username });
                }}
              >
                准备
              </Button>
            </div>
          )}
        </>
      );
    }
    if (item.ready && !start) {
      return <p>已准备...</p>;
    }
    if (item.giveUp) {
      return <p>已弃牌...</p>;
    }
    if (item.out) {
      return <p>已出局...</p>;
    }
    if (start && !item.watched && item.ready) {
      return (
        <>
          <p>未看牌...{item.name !== username && item.currBase > 0 && <span>下{item.currBase}</span>}</p>
          {playerIdx === index && btnGroupContent(item)}
        </>
      );
    }
    if (item.name !== username && item.watched) {
      return (
        <p>
          已看牌...
          {item.currBase > 0 && <span>下{item.currBase}</span>}
        </p>
      );
    }
    if (item.name === username && item.watched && poker) {
      return (
        <>
          {pokerListContent(poker)}
          {playerIdx === index && btnGroupContent(item)}
        </>
      );
    }
    return '';
  };

  const leaveRoomFn = () => {
    if (username === master) {
      socket.emit('destroyRoom', { id: roomId });
    } else {
      socket.emit('leaveRoom', { id: roomId, username });
      message.warn('您已退出房间');
      history.replace('/');
    }
  };

  const leaveRoom = () => {
    leaveRoomFn();
  };

  const onChangeFill = (e: RadioChangeEvent) => {
    setCurrBase(e.target.value);
  };

  return (
    <div className={style.roomWrapper}>
      <header>
        <p>房间名：{roomName}</p>
        <p>房间号：{roomId}</p>
        <p>当前房间人数：{users.length || 0}</p>
        <Button type="primary" onClick={leaveRoom}>
          {master === username ? '解散房间' : '退出房间'}
        </Button>
      </header>
      <main>
        <div className={style.desktop} />
        <div className={style.center}>
          {users.map((item, idx) => {
            return (
              // eslint-disable-next-line react/no-array-index-key
              <div className={style.userCard} style={getStyle(idx)} key={idx}>
                <div className={style.name}>{item.name}</div>
                {pokerContent(item, idx)}
              </div>
            );
          })}
        </div>
        <div className={style.jackpot}>底池：{getJackpot()}</div>
        <ScoreList users={users} />
      </main>
      <Modal
        visible={visible}
        maskClosable={false}
        closable={false}
        title="是否看牌"
        onOk={async () => {
          const {
            data: { poker: nPoker },
          } = await watchPoker();
          setPoker(formatPoker(nPoker));
          setVisible(false);
        }}
        onCancel={() => {
          setVisible(false);
        }}
      >
        <p>是否看牌</p>
      </Modal>
      <Modal
        visible={fillModalVisible}
        maskClosable={false}
        onCancel={() => setFillModalVisible(false)}
        title="下注"
        onOk={() => {
          socket.emit('fill', { currBase: users[playerIdx].watched ? currBase : currBase! * 2, id: roomId, username });
          setFillModalVisible(false);
        }}
      >
        <Radio.Group onChange={onChangeFill}>
          {fillList.map((item) => {
            return (
              <Radio value={item} key={item}>
                {item}
              </Radio>
            );
          })}
        </Radio.Group>
      </Modal>
      <Modal
        title="比牌"
        visible={compareModalVisible}
        maskClosable={false}
        onOk={() => {
          socket.emit('compare', { id: roomId, username, comparePlayer });
          setCompareModalVisible(false);
        }}
        onCancel={() => setCompareModalVisible(false)}
      >
        <Select
          style={{ width: 470 }}
          value={comparePlayer}
          onChange={(name: string) => {
            setComparePlayer(name);
          }}
          placeholder="请选择比牌玩家"
        >
          {comparePlayerList &&
            comparePlayerList.map((item) => (
              <Select.Option value={item} key={item}>
                {item}
              </Select.Option>
            ))}
        </Select>
      </Modal>
    </div>
  );
}

export default AuthRoute(Room);
