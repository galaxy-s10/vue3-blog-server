import { WebSocketServer } from 'ws';

import { chalkINFO } from '@/app/chalkTip';

const webSocketMsgType = {
  connect: 'connect', // 用户连接
  userInRoom: 'userInRoom', // 用户进入聊天
  userOutRoom: 'userOutRoom', // 用户退出聊天
  userSendMsg: 'userSendMsg', // 用户发送消息
  heartbeatCheck: 'heartbeatCheck', // 心跳检测
};

export const initWs = (server) => {
  const wss = new WebSocketServer({
    // port: 3300,
    server,
  });

  const chatInfo = {
    onlineCount: 0, // 在线人数
    onlineUserList: [], // 在线用户列表
  };
  function heartbeat() {
    console.log(new Date().toLocaleString(), '收到pong');
    this.isAlive = true;
  }

  const interval = setInterval(function ping() {
    // console.log(wss.clients, 3333333);
    // eslint-disable-next-line consistent-return
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();
      // eslint-disable-next-line no-param-reassign
      ws.isAlive = false;
      ws.ping();
    });
  }, 10000);

  wss.on('connection', function connection(ws) {
    // eslint-disable-next-line no-param-reassign
    ws.isAlive = true;
    // ws.on('pong', heartbeat);
    const sendMsg = ({ type, data }) => {
      ws.send(JSON.stringify({ type, data, time: +new Date() }));
    };
    const handleReceiveMessage = (receiveData) => {
      console.log(
        chalkINFO(`${new Date().toLocaleString()}收到ws消息：`),
        receiveData
      );
      const { type } = receiveData;
      switch (type) {
        case webSocketMsgType.heartbeatCheck:
          console.log('用户进行心跳检测');
          sendMsg({ type, data: receiveData.data });
          break;
        case webSocketMsgType.connect:
          console.log('用户连接了');
          sendMsg({ type, data: receiveData.data });
          break;
        case webSocketMsgType.userInRoom:
          console.log('用户进入聊天了');
          sendMsg({ type, data: receiveData.data });
          break;
        case webSocketMsgType.userOutRoom:
          console.log('用户退出聊天了');
          sendMsg({ type, data: receiveData.data });
          break;
        case webSocketMsgType.userSendMsg:
          console.log('用户发送消息了');
          sendMsg({ type, data: receiveData.data });
          break;
        default:
          break;
      }
    };
    ws.on('open', function open() {
      console.log('opennnnnnnnn');
      sendMsg({ type: webSocketMsgType.userInRoom, data: 'ok' });
    });
    ws.on('message', function message(data) {
      handleReceiveMessage(JSON.parse(data));
    });

    wss.on('close', function close() {
      console.log(chalkINFO(`${new Date().toLocaleString()}关闭ws连接`));
      clearInterval(interval);
    });
    wss.on('error', function close() {
      console.log(chalkINFO(`${new Date().toLocaleString()}报错了`));
      clearInterval(interval);
    });
  });
};
