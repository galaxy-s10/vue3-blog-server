import { Server } from 'socket.io';

import WsRedisController from './redis.controller';

import { PROJECT_ENV } from '@/constant';
import interactionController from '@/controller/interaction.controller';
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
  /** 断开连接*/
  disconnecting: 'disconnecting',
  /** 重新连接 */
  reconnect: 'reconnect',
};

// websocket用户类型
export const wsUserType = {
  visitor: 1, // 游客
  user: 2, // 用户
};

async function getOnline() {
  const [visitor, user] = await Promise.all([
    WsRedisController.getAllOnlineVisitorNum(),
    WsRedisController.getAllOnlineUserNum(),
  ]);
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
    socket.on(wsMsgType.getOnlineUserNum, async (data) => {
      const { visitor, user } = await getOnline();
      console.log(socket.id, '获取在线用户', data);
      io.emit(wsMsgType.getOnlineUserNum, {
        count: user,
        time: new Date().toLocaleString(),
      });
      io.emit(wsMsgType.getOnlineVisitorNum, {
        count: visitor,
        time: new Date().toLocaleString(),
      });
    });

    // 获取在线游客
    socket.on(wsMsgType.getOnlineVisitorNum, async (data) => {
      console.log(socket.id, '获取在线游客', data);
      const { visitor } = await getOnline();
      io.emit(wsMsgType.getOnlineVisitorNum, {
        count: visitor,
        time: new Date().toLocaleString(),
      });
    });

    // 用户进房间
    socket.on(
      wsMsgType.userInRoom,
      async (data: {
        userInfo: {
          id: string;
          userType: number;
          username: string;
          avatar: string;
        };
        userType: number;
        value: any;
      }) => {
        console.log(socket.id, socket.request['x-real-ip'], '用户进房间', data);
        const { id } = socket;
        const { userType } = data;
        await Promise.all([
          userType === wsUserType.user
            ? WsRedisController.addOnlineUser(id, data)
            : WsRedisController.addOnlineVisitor(id, data),
          WsRedisController.addOnlineList(id, data),
        ]);
        const { visitor, user } = await getOnline();
        io.emit(wsMsgType.userInRoom, {
          id,
          userInfo: data.userInfo,
          userType: data.userType,
          value: data.value,
          time: new Date().toLocaleString(),
        });
        io.emit(wsMsgType.getOnlineVisitorNum, {
          count: visitor,
          time: new Date().toLocaleString(),
        });
        io.emit(wsMsgType.getOnlineUserNum, {
          count: user,
          time: new Date().toLocaleString(),
        });
      }
    );

    // 用户退出房间
    socket.on(
      wsMsgType.userOutRoom,
      async (data: {
        userInfo: {
          id: string;
          userType: number;
          username: string;
          avatar: string;
        };
        userType: number;
      }) => {
        console.log(socket.id, '用户退出房间', data);
        const { id } = socket;
        const { userType } = data;
        const res = await WsRedisController.getOnlineUser(id);
        await Promise.all([
          userType === wsUserType.user
            ? WsRedisController.deleteOnlineUser(id)
            : WsRedisController.deleteOnlineVisitor(id),
          WsRedisController.deleteOnlineList(id),
        ]);
        const { visitor, user } = await getOnline();
        if (res) {
          io.emit(wsMsgType.userOutRoom, {
            id,
            userInfo: JSON.parse(res).userInfo,
            userType: JSON.parse(res).userType,
            time: new Date().toLocaleString(),
          });
        } else if (data) {
          io.emit(wsMsgType.userOutRoom, {
            id,
            userInfo: data.userInfo,
            userType: data.userType,
            time: new Date().toLocaleString(),
          });
        }
        io.emit(wsMsgType.getOnlineVisitorNum, {
          count: visitor,
          time: new Date().toLocaleString(),
        });
        io.emit(wsMsgType.getOnlineUserNum, {
          count: user,
          time: new Date().toLocaleString(),
        });
      }
    );

    // 用户发送消息
    socket.on(wsMsgType.userSendMsg, (data) => {
      console.log(socket.id, '用户发送消息', data);
      //  socket.emit会将消息发送给发件人
      //  socket.broadcast.emit会将消息发送给除了发件人以外的所有人
      // io.emit会将消息发送给所有人，包括发件人
      const { id } = socket;
      io.emit(wsMsgType.userSendMsg, {
        id,
        userInfo: data.userInfo,
        userType: data.userType,
        value: data.value,
        time: new Date().toLocaleString(),
      });
      interactionController.common.create({
        client_ip: socket.request['x-real-ip'] || '-1',
        client: '',
        user_info: JSON.stringify(data.userInfo),
        user_type: data.userType,
        type: wsMsgType.userSendMsg,
        value: JSON.stringify(data.value),
      });
    });

    // 游客切换头像
    socket.on(wsMsgType.visitorSwitchAvatar, (data) => {
      console.log(socket.id, '游客切换头像', data);
      //  socket.emit会将消息发送给发件人
      //  socket.broadcast.emit会将消息发送给除了发件人以外的所有人
      // io.emit会将消息发送给所有人，包括发件人
      const { avatar } = data;
      io.emit(wsMsgType.visitorSwitchAvatar, {
        code: 200,
        avatar,
        time: new Date().toLocaleString(),
      });
    });

    // 断开连接
    socket.on(wsConnectStatus.disconnect, async (reason) => {
      console.log(
        socket.id,
        chalkINFO(`${new Date().toLocaleString()}，断开连接`)
      );
      console.log(reason);
      const { id } = socket;
      const data = await WsRedisController.getOnlineList(id);

      if (data) {
        const { userInfo } = JSON.parse(data);
        io.emit(wsMsgType.userOutRoom, {
          id,
          userInfo,
          userType: userInfo.userType,
          time: new Date().toLocaleString(),
        });
        if (userInfo.userType === wsUserType.user) {
          WsRedisController.deleteOnlineUser(id);
        } else if (userInfo.userType === wsUserType.visitor) {
          WsRedisController.deleteOnlineVisitor(id);
        }
        WsRedisController.deleteOnlineList(id);
      }
      const { visitor, user } = await getOnline();

      io.emit(wsMsgType.getOnlineVisitorNum, {
        count: visitor,
        time: new Date().toLocaleString(),
      });
      io.emit(wsMsgType.getOnlineUserNum, {
        count: user,
        time: new Date().toLocaleString(),
      });
    });

    socket.on(wsConnectStatus.disconnecting, (reason) => {
      console.log(
        socket.id,
        chalkINFO(`${new Date().toLocaleString()}-disconnecting`)
      );
      console.log(reason);
    });
  });
};
