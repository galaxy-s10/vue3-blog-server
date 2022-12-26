import { Server } from 'socket.io';

import { PROJECT_ENV } from '@/constant';
import { chalkINFO } from '@/utils/chalkTip';

const webSocketMsgType = {
  connect: 'connect', // 用户连接
  userInRoom: 'userInRoom', // 用户进入聊天
  userOutRoom: 'userOutRoom', // 用户退出聊天
  userSendMsg: 'userSendMsg', // 用户发送消息
  getOnlineUser: 'getOnlineUser', // 获取在线用户
  chooseSong: 'chooseSong', // 点歌
};

const onlineList = {};

export const connectWebSocket = (server) => {
  if (PROJECT_ENV === 'beta') {
    console.log(chalkINFO('当前是beta环境，不初始化websocket'));
    return;
  }
  console.log(chalkINFO('当前非beta环境，初始化websocket'));
  const io = new Server(server);
  io.on('connection', function connection(socket) {
    // 获取在线用户
    socket.on(webSocketMsgType.getOnlineUser, (data) => {
      console.log(socket.id, '获取在线用户', data);
      io.emit(webSocketMsgType.getOnlineUser, {
        count: Object.keys(onlineList).length,
        time: new Date().toLocaleString(),
      });
    });

    // 用户进房间
    socket.on(webSocketMsgType.userInRoom, (data) => {
      console.log(socket.id, '用户进房间', data);
      const { nickname, avatar } = data;
      onlineList[socket.id] = { id: socket.id, nickname, avatar };
      io.emit(webSocketMsgType.userInRoom, {
        nickname,
        avatar,
        time: new Date().toLocaleString(),
      });
      io.emit(webSocketMsgType.getOnlineUser, {
        count: Object.keys(onlineList).length,
        time: new Date().toLocaleString(),
      });
    });

    // 用户退出房间
    socket.on(webSocketMsgType.userOutRoom, (data) => {
      console.log(socket.id, '用户退出房间', data);
      io.emit(webSocketMsgType.userOutRoom, {
        nickname: onlineList[socket.id].nickname,
        time: new Date().toLocaleString(),
      });
      delete onlineList[socket.id];
      io.emit(webSocketMsgType.getOnlineUser, {
        count: Object.keys(onlineList).length,
        time: new Date().toLocaleString(),
      });
    });

    // 用户发送消息
    socket.on(webSocketMsgType.userSendMsg, (data) => {
      console.log(socket.id, '用户发送消息', data);
      const { nickname, avatar, msg } = data;
      //  socket.emit会将消息发送给发件人
      //  socket.broadcast.emit会将消息发送给除了发件人以外的所有人
      // io.emit会将消息发送给所有人，包括发件人
      io.emit(webSocketMsgType.userSendMsg, {
        id: socket.id,
        nickname,
        avatar,
        msg,
        time: new Date().toLocaleString(),
      });
    });

    // 用户点歌
    socket.on(webSocketMsgType.chooseSong, (data) => {
      console.log(socket.id, '用户点歌', data);
      // 判断nickname, avatar等用户输入
      const { nickname, avatar, msg } = data;
      //  socket.emit会将消息发送给发件人
      //  socket.broadcast.emit会将消息发送给除了发件人以外的所有人
      // io.emit会将消息发送给所有人，包括发件人
      io.emit(webSocketMsgType.userSendMsg, {
        id: socket.id,
        nickname,
        avatar,
        msg,
        time: new Date().toLocaleString(),
      });
    });

    // 断开
    socket.on('disconnect', (reason) => {
      console.log(
        socket.id,
        chalkINFO(`${new Date().toLocaleString()}-disconnect`)
      );
      console.log(reason);
      if (onlineList[socket.id]) {
        io.emit(webSocketMsgType.userOutRoom, {
          nickname: onlineList[socket.id].nickname,
          time: new Date().toLocaleString(),
        });
        delete onlineList[socket.id];
      }
      io.emit(webSocketMsgType.getOnlineUser, {
        count: Object.keys(onlineList).length,
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
