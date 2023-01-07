import { Server } from 'socket.io';

import {
  IData,
  IUserInfo,
  liveExp,
  wsConnectStatus,
  wsMsgType,
  wsUserType,
} from './constant';
import WsRedisController from './redis.controller';

import { pubClient } from '@/config/redis/pub';
import { REDIS_CONFIG } from '@/config/secret';
import { PROJECT_ENV, REDIS_PREFIX } from '@/constant';
import interactionController from '@/controller/interaction.controller';
import interactionStatisController from '@/controller/interactionStatis.controller';
import { InteractionStatisType } from '@/interface';
import { dateStartAndEnd } from '@/utils';
import { chalkINFO } from '@/utils/chalkTip';

async function getOnline() {
  const [visitor, user] = await Promise.all([
    WsRedisController.getAllOnlineVisitorNum(),
    WsRedisController.getAllOnlineUserNum(),
  ]);
  return { visitor, user };
}

function initLog(type: string, socket: any) {
  console.log(
    // eslint-disable-next-line
    `${type}, socket.id: ${socket.id}, x-real-ip: ${socket.request['x-real-ip']}`
  );
}

export const connectWebSocket = (server) => {
  if (PROJECT_ENV === 'beta') {
    console.log(chalkINFO('当前是beta环境，不初始化websocket'));
    return;
  }

  console.log(chalkINFO('当前非beta环境，初始化websocket'));

  const io = new Server(server);

  async function emitNum() {
    const { visitor, user } = await getOnline();
    // eslint-disable-next-line
    const currTotal = visitor + user;
    const olddata = await WsRedisController.getCurrDayHightOnlineNum();
    const oldTotal = olddata ? JSON.parse(olddata).data : 1;
    if (olddata) {
      if (oldTotal < currTotal) {
        WsRedisController.setCurrDayHightOnlineNum({
          created_at: new Date().toLocaleString(),
          data: currTotal,
        });
      }
    } else {
      WsRedisController.setCurrDayHightOnlineNum({
        created_at: new Date().toLocaleString(),
        data: 1,
      });
    }
    io.emit(wsMsgType.getOnlineData, {
      historyHightOnlineNum: Math.max(currTotal, oldTotal),
      currDayHightOnlineNum: Math.max(currTotal, oldTotal),
      user,
      visitor,
      created_at: new Date().toLocaleString(),
    });
    const res = await interactionStatisController.common.getList({
      type: InteractionStatisType.dayInfo,
      orderBy: 'asc',
      orderName: 'id',
      rangTimeType: 'created_at',
      rangTimeStart: dateStartAndEnd(new Date()).startTime,
      rangTimeEnd: dateStartAndEnd(new Date()).endTime,
    });
    if (!res.rows.length) {
      interactionStatisController.common.create({
        key: new Date().toLocaleString(),
        value: JSON.stringify({
          historyHightOnlineNum: Math.max(currTotal, oldTotal),
          currDayHightOnlineNum: Math.max(currTotal, oldTotal),
          user,
          visitor,
        }),
        type: InteractionStatisType.dayInfo,
        desc: '当天的数据',
      });
    } else {
      interactionStatisController.common.update({
        id: res.rows[0].id,
        key: new Date().toLocaleString(),
        value: JSON.stringify({
          historyHightOnlineNum: Math.max(currTotal, oldTotal),
          currDayHightOnlineNum: Math.max(currTotal, oldTotal),
          user,
          visitor,
        }),
        type: InteractionStatisType.dayInfo,
        desc: '当天的数据',
      });
    }
    const historyInfoRes = await interactionStatisController.common.getList({
      type: InteractionStatisType.historyInfo,
      orderBy: 'asc',
      orderName: 'id',
    });
    interactionStatisController.common.update({
      id: historyInfoRes.rows[0].id,
      key: 'historyHightOnlineNum',
      value: JSON.stringify({
        historyHightOnlineNum: Math.max(currTotal, oldTotal),
        currDayHightOnlineNum: Math.max(currTotal, oldTotal),
        user,
        visitor,
      }),
    });
  }

  pubClient.subscribe(
    `__keyevent@${REDIS_CONFIG.database}__:expired`,
    async (redisKey, subscribeName) => {
      console.log('过期key监听', redisKey, subscribeName);
      if (redisKey.match(REDIS_PREFIX.live)) {
        const id = redisKey.replace(`${REDIS_PREFIX.live}-`, '');
        const res = await WsRedisController.getOnlineList(id);
        if (res) {
          const { data }: IData = JSON.parse(res);
          const { userInfo } = data;
          io.emit(wsMsgType.userOutRoom, {
            id,
            userInfo,
            created_at: new Date().toLocaleString(),
          });
          if (userInfo.userType === wsUserType.user) {
            await WsRedisController.deleteOnlineUser(id);
          } else if (userInfo.userType === wsUserType.visitor) {
            await WsRedisController.deleteOnlineVisitor(id);
          }
          await WsRedisController.deleteOnlineList(id);
          emitNum();
        }
      }
    }
  );

  io.on(wsConnectStatus.connection, (socket) => {
    console.log('connection');

    // 用户还在线
    socket.on(wsMsgType.live, async () => {
      initLog('用户还在线', socket);
      const { id } = socket;
      const res = await WsRedisController.getOnlineList(id);
      if (res) {
        const { data }: IData = JSON.parse(res);
        WsRedisController.live(id, {
          created_at: new Date().toLocaleString(),
          exp: liveExp,
          data: data.userInfo,
        });
      }
    });

    // 用户进房间
    socket.on(
      wsMsgType.userInRoom,
      async (data: { userInfo: IUserInfo; value: any }) => {
        initLog('用户进房间', socket);
        const { id } = socket;
        WsRedisController.live(id, {
          created_at: new Date().toLocaleString(),
          exp: liveExp,
          data: data.userInfo,
        });
        await Promise.all([
          data.userInfo.userType === wsUserType.user
            ? WsRedisController.addOnlineUser(id, {
                created_at: new Date().toLocaleString(),
                data,
              })
            : WsRedisController.addOnlineVisitor(id, {
                created_at: new Date().toLocaleString(),
                data,
              }),
          WsRedisController.addOnlineList(id, {
            created_at: new Date().toLocaleString(),
            data,
          }),
        ]);
        io.emit(wsMsgType.userInRoom, {
          id,
          userInfo: data.userInfo,
          value: data.value,
          created_at: new Date().toLocaleString(),
        });
        emitNum();
      }
    );

    // 用户退出房间
    socket.on(wsMsgType.userOutRoom, () => {
      initLog('用户退出房间', socket);
      const { id } = socket;
      WsRedisController.die(id);
    });

    // 用户发送消息
    socket.on(wsMsgType.userSendMsg, (data) => {
      initLog('用户发送消息', socket);
      //  socket.emit会将消息发送给发件人
      //  socket.broadcast.emit会将消息发送给除了发件人以外的所有人
      // io.emit会将消息发送给所有人，包括发件人
      const { id } = socket;
      io.emit(wsMsgType.userSendMsg, {
        id,
        userInfo: data.userInfo,
        value: data.value,
        created_at: new Date().toLocaleString(),
      });
      interactionController.common.create({
        client_ip: socket.request['x-real-ip'] || '-1',
        client: '',
        user_info: JSON.stringify(data.userInfo),
        user_type: data.userInfo.userType,
        type: wsMsgType.userSendMsg,
        value: JSON.stringify(data.value),
      });
    });

    // 游客切换头像
    socket.on(wsMsgType.visitorSwitchAvatar, (data) => {
      initLog('游客切换头像', socket);
      const { avatar } = data;
      io.emit(wsMsgType.visitorSwitchAvatar, {
        code: 200,
        avatar,
        created_at: new Date().toLocaleString(),
      });
    });

    // 断开连接中
    socket.on(wsConnectStatus.disconnecting, (reason) => {
      initLog('断开连接中', socket);
      console.log(reason);
    });

    // 已断开连接
    socket.on(wsConnectStatus.disconnect, (reason) => {
      initLog('已断开连接', socket);
      console.log(reason);
      const { id } = socket;
      WsRedisController.die(id);
    });
  });
};
