import { Item } from 'rc-menu';

interface IPoker {
  type: string;
  num: number;
}

interface INewPoker extends IPoker {
  ft: string;
  fn: string | number;
}
type IFormatPoker = (data: IPoker[]) => INewPoker[];
enum PokerType {
  S = '♠',
  H = '♥',
  D = '♦',
  C = '♣',
}

export const formatPoker: IFormatPoker = (poker) => {
  return poker.map((item) => {
    let fn: string | number = item.num;
    if (item.num === 14) {
      fn = 'A';
    } else if (item.num === 11) {
      fn = 'J';
    } else if (item.num === 12) {
      fn = 'Q';
    } else if (item.num === 13) {
      fn = 'K';
    }
    return {
      ...item,
      ft: PokerType[item.type],
      fn,
    };
  });
};
