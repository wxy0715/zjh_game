import React, { memo } from 'react';
import style from './ScoreList.module.less';
import { IUser } from '../index';

interface IProps {
  users: IUser[];
}

const ScoreList: React.FC<IProps> = ({ users }) => {
  return (
    <div className={style.scoreListWrapper}>
      <h4>得分榜</h4>
      <div className={style.list}>
        {users.map((item) => (
          <div className={style.item} key={item.name}>
            <span className={style.name}>{item.name}</span>
            <span className={style.score}>{item.allPoint || 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default memo(ScoreList);
