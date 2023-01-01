import { Server } from 'socket.io';

import { PROJECT_ENV } from '@/constant';
import { chalkINFO } from '@/utils/chalkTip';

// websocket消息类型
export const wsMsgType = {
  /** 用户连接 */
  connect: 'connect',
  /** 用户进入聊天 */
  userInRoom: 'userInRoom',
  /** 游客切换头像 */
  visitorSwitchAvatar: 'visitorSwitchAvatar',
  /** 用户退出聊天 */
  userOutRoom: 'userOutRoom',
  /** 用户发送消息 */
  userSendMsg: 'userSendMsg',
  /** 获取在线游客数 */
  getOnlineVisitorNum: 'getOnlineVisitorNum',
  /** 获取在线用户数 */
  getOnlineUserNum: 'getOnlineUserNum',
  /** 获取历史最高同时在线数（游客+用户） */
  getHistoryHightOnlineNum: 'getHistoryHightOnlineNum',
};

// websocket连接状态
export const wsConnectStatus = {
  /** 连接中 */
  connecting: 'connecting',
  /** 已连接 */
  connected: 'connected',
  /** 断开连接 */
  disconnect: 'disconnect',
  /** 重新连接 */
  reconnect: 'reconnect',
};

// websocket用户类型
export const wsUserType = {
  visitor: 1, // 游客
  user: 2, // 用户
};

const onlineList = {};

function getOnline() {
  let visitor = 0;
  let user = 0;
  Object.keys(onlineList).forEach((key) => {
    const item = onlineList[key];
    if (item.userType === wsUserType.visitor) {
      visitor += 1;
    } else if (item.userType === wsUserType.user) {
      user += 1;
    }
  });
  return { visitor, user };
}

export const connectWebSocket = (server) => {
  if (PROJECT_ENV === 'beta') {
    console.log(chalkINFO('当前是beta环境，不初始化websocket'));
    return;
  }
  console.log(chalkINFO('当前非beta环境，初始化websocket'));
  const io = new Server(server);
  io.on('connection', function connection(socket) {
    // 获取在线用户
    socket.on(wsMsgType.getOnlineUserNum, (data) => {
      console.log(socket.id, '获取在线用户', onlineList, data);
      io.emit(wsMsgType.getOnlineUserNum, {
        count: getOnline().user,
        time: new Date().toLocaleString(),
      });
    });

    // 获取在线游客
    socket.on(wsMsgType.getOnlineVisitorNum, (data) => {
      console.log(socket.id, '获取在线游客', data);
      io.emit(wsMsgType.getOnlineVisitorNum, {
        count: getOnline().visitor,
        time: new Date().toLocaleString(),
      });
    });

    // 用户进房间
    socket.on(wsMsgType.userInRoom, (data) => {
      console.log(socket.id, '用户进房间', data);
      const { id } = socket;
      onlineList[id] = data;
      io.emit(wsMsgType.userInRoom, {
        ...data,
        time: new Date().toLocaleString(),
      });
      io.emit(wsMsgType.getOnlineVisitorNum, {
        count: getOnline().visitor,
        time: new Date().toLocaleString(),
      });
      io.emit(wsMsgType.getOnlineUserNum, {
        count: getOnline().user,
        time: new Date().toLocaleString(),
      });
    });

    // 用户退出房间
    socket.on(wsMsgType.userOutRoom, (data) => {
      console.log(socket.id, '用户退出房间', data);
      io.emit(wsMsgType.userOutRoom, {
        ...data,
        time: new Date().toLocaleString(),
      });
      delete onlineList[socket.id];
      io.emit(wsMsgType.getOnlineVisitorNum, {
        count: getOnline().visitor,
        time: new Date().toLocaleString(),
      });
    });

    // 用户发送消息
    socket.on(wsMsgType.userSendMsg, (data) => {
      console.log(socket.id, '用户发送消息', data);
      //  socket.emit会将消息发送给发件人
      //  socket.broadcast.emit会将消息发送给除了发件人以外的所有人
      // io.emit会将消息发送给所有人，包括发件人
      io.emit(wsMsgType.userSendMsg, {
        ...data,
        time: new Date().toLocaleString(),
      });
    });

    // 游客切换头像
    socket.on(wsMsgType.visitorSwitchAvatar, (data) => {
      console.log(socket.id, '游客切换头像', data);
      //  socket.emit会将消息发送给发件人
      //  socket.broadcast.emit会将消息发送给除了发件人以外的所有人
      // io.emit会将消息发送给所有人，包括发件人
      const { avatar } = data;
      onlineList[socket.id].avatar = avatar;
      io.emit(wsMsgType.visitorSwitchAvatar, {
        code: 200,
        avatar,
        time: new Date().toLocaleString(),
      });
    });

    // // 用户点歌
    // socket.on(wsMsgType.chooseSong, (data) => {
    //   console.log(socket.id, '用户点歌', data);
    //   // 判断nickname, avatar等用户输入
    //   const { nickname, avatar, msg } = data;
    //   //  socket.emit会将消息发送给发件人
    //   //  socket.broadcast.emit会将消息发送给除了发件人以外的所有人
    //   // io.emit会将消息发送给所有人，包括发件人
    //   io.emit(wsMsgType.userSendMsg, {
    //     id: socket.id,
    //     nickname,
    //     avatar,
    //     msg,
    //     time: new Date().toLocaleString(),
    //   });
    // });

    // 断开
    socket.on('disconnect', (reason) => {
      console.log(
        socket.id,
        chalkINFO(`${new Date().toLocaleString()}-disconnect`)
      );
      console.log(reason);
      const { id } = socket;

      if (onlineList[id]) {
        io.emit(wsMsgType.userOutRoom, {
          id,
          time: new Date().toLocaleString(),
        });
        delete onlineList[socket.id];
      }
      io.emit(wsMsgType.getOnlineVisitorNum, {
        count: getOnline().visitor,
        time: new Date().toLocaleString(),
      });
    });

    socket.on('disconnecting', (reason) => {
      console.log(
        socket.id,
        chalkINFO(`${new Date().toLocaleString()}-disconnecting`)
      );
      console.log(reason);
    });
  });
};
