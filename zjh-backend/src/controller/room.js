const infoData = require("../data");

const roomList = (ctx) => {
  ctx.body = {
    code: 0,
    data: infoData.publicRooms,
  };
};

const watchPoker = (ctx) => {
  // 获取用户名和房间id
  const { username, id } = ctx.request.body;
  // 房间索引
  const idx = infoData.publicRooms.findIndex((item) => item.id === id);
  // 用户索引
  const userIdx = infoData.publicRooms[idx].user.findIndex(
    (item) => item.name === username
  );
  // 改变用户看牌状态
  infoData.publicRooms[idx].user[userIdx].watched = true;
  // 执行更新操作
  global.socket.server.in(id).emit("update", infoData.publicRooms[idx]);
  ctx.body = {
    code: 0,
    data: {
      poker: infoData.pokerData[id][userIdx],
    },
  };
};

module.exports = {
  roomList,
  watchPoker,
};
