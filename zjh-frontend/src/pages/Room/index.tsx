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
/**
 * 用户结构体
 */
export interface IUser {
  name: string;  // 用户名
  ready: boolean; // 是否准备
  pokerData?: any[]; // 牌号
  watched: boolean; // 是否看牌
  point: number; // 当前局上注
  allPoint: number; // 总上注
  giveUp: boolean;  // 是否弃牌
  currBase: number; // 当前基数
  out: boolean; // 是否出局
}

/**
 * 房间结构体
 */
interface IRoomInfo {
  master: string; // 房主账号
  roomName: string; // 房间名
  user: IUser[]; //在房间的用户
  id: string; // 房间号
  start: boolean; // 是否已经开始游戏
  playerIdx: number; // 轮训到的玩家索引
  base: number; // 基数
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

  // 房间主体
  const {
    master, // 房主账号
    roomName, // 房间名
    user: users = [], //在房间的用户
    id: roomId, // 房间号
    start = false, // 是否已经开始游戏
    playerIdx = 0, // 轮训到的玩家索引
    base, // 基数
  } = room.roomInfo as IRoomInfo;

  // 用户名
  const { username } = userModel.userInfo;
  // 自己的位置
  const selfIndex = users.findIndex((item) => item.name === username);

  /**
   * 计算本局底池
   */
  const getJackpot = () => {
    let total = 0;
    users.forEach((item) => {
      total += item.point;
    });
    return Math.abs(total);
  };

  /**
   * 看牌
   */
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

  /**
   * 监听是否开始对局,玩家索引变化,用户名变化,用户变化
   */
  useEffect(() => {
    if (start) {
      if (username === users[playerIdx].name && !users[playerIdx].watched) {
        setVisible(true);
      }
      const list = users.filter((item) => !item.giveUp && !item.out && item.name !== username).map((item) => item.name);
      setComparePlayerList(list);
    }
  }, [start, playerIdx, username, users]);

  /**
   * 监听用户变化,基数变化,玩家索引变化
   */
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

  /**
   * 加注,弃牌,比牌,开始功能
   */
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
  /**
   * 状态 是否准备,是否看牌,是否出局
   */
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

  /**
   * 离开房间
   */
  const leaveRoom = () => {
    if (username === master) {
      socket.emit('destroyRoom', { id: roomId });
    } else {
      // 弃牌
      socket.emit('giveUp', { id: roomId, username });
      // 退出
      socket.emit('leaveRoom', { id: roomId, username });
      message.warn('您已退出房间');
      history.replace('/');
    }
  };

  /**
   * 改变当前基数
   */
  const onChangeFill = (e: RadioChangeEvent) => {
    setCurrBase(e.target.value);
  };

  /**
   * 页面ui组件
   */
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
          setFillModalVisible(true)
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
