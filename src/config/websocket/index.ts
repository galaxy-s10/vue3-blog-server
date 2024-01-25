import { Server, Socket } from 'socket.io';

import {
  IData,
  liveExp,
  wsConnectStatus,
  wsMsgType,
  wsUserType,
} from './constant';
import WsRedisController from './redis.controller';

import { pubClient } from '@/config/redis/pub';
import { REDIS_PREFIX } from '@/constant';
import interactionController from '@/controller/interaction.controller';
import interactionStatisController from '@/controller/interactionStatis.controller';
import { InteractionStatisType } from '@/interface';
import { REDIS_CONFIG } from '@/secret/secret';
import { dateStartAndEnd } from '@/utils';
import { chalkINFO } from '@/utils/chalkTip';

async function getOnline() {
  const [visitor, user, historyInfo] = await Promise.all([
    WsRedisController.getAllOnlineVisitorNum(),
    WsRedisController.getAllOnlineUserNum(),
    interactionStatisController.common.getList({
      type: InteractionStatisType.historyInfo,
      orderBy: 'asc',
      orderName: 'id',
    }),
  ]);
  return {
    visitor,
    user,
    history: JSON.parse(historyInfo.rows[0].value).historyHightOnlineNum,
  };
}

function prettierLog(type: string, socket: Socket) {
  console.log(
    `${type}, socket.id: ${socket.id}, x-real-ip: ${
      socket.request.headers['x-real-ip'] as string
    }`
  );
}

function getClient(socket: Socket) {
  const { id, request } = socket;
  return {
    client_ip: (request.headers['x-real-ip'] as string) || '-1',
    id,
  };
}

export const connectWebSocket = (server) => {
  console.log(chalkINFO('当前非beta环境，初始化websocket'));

  const io = new Server(server);

  async function emitNum(client_ip: string) {
    const { visitor, user, history } = await getOnline();
    const currTotal = visitor + user;
    const olddataJson = await WsRedisController.getCurrDayHightOnlineNum();
    const olddata = olddataJson ? JSON.parse(olddataJson) : {};
    const oldTotal = olddata.data || 1;
    const currTime = new Date().toLocaleString();
    if (olddataJson) {
      // 比较时间戳大小
      if (new Date(currTime) > new Date(olddata.created_at)) {
        WsRedisController.setCurrDayHightOnlineNum({
          client_ip,
          created_at: currTime,
          data: 1,
        });
      } else if (oldTotal < currTotal) {
        WsRedisController.setCurrDayHightOnlineNum({
          client_ip,
          created_at: currTime,
          data: currTotal,
        });
      }
    } else {
      WsRedisController.setCurrDayHightOnlineNum({
        client_ip,
        created_at: currTime,
        data: 1,
      });
    }
    io.emit(wsMsgType.getOnlineData, {
      historyHightOnlineNum: Math.max(history, currTotal, oldTotal),
      currDayHightOnlineNum: Math.max(currTotal, oldTotal),
      user,
      visitor,
      created_at: currTime,
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
        key: currTime,
        value: JSON.stringify({
          historyHightOnlineNum: Math.max(history, currTotal, oldTotal),
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
        key: currTime,
        value: JSON.stringify({
          historyHightOnlineNum: Math.max(
            history,
            currTotal,
            oldTotal,
            JSON.parse(res.rows[0].value).historyHightOnlineNum
          ),
          currDayHightOnlineNum: Math.max(
            currTotal,
            oldTotal,
            JSON.parse(res.rows[0].value).currDayHightOnlineNum
          ),
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
      value: JSON.stringify({
        historyHightOnlineNum: Math.max(
          history,
          currTotal,
          oldTotal,
          res.rows[0] ? JSON.parse(res.rows[0].value).historyHightOnlineNum : 0
        ),
        currDayHightOnlineNum: Math.max(
          currTotal,
          oldTotal,
          res.rows[0] ? JSON.parse(res.rows[0].value).historyHightOnlineNum : 0
        ),
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
          const { data, client_ip }: IData = JSON.parse(res);
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
          emitNum(client_ip);
        }
      }
    }
  );

  io.on(wsConnectStatus.connection, (socket: Socket) => {
    console.log('connection');

    // 用户还在线
    socket.on(wsMsgType.live, async () => {
      prettierLog('用户还在线', socket);
      const { id, client_ip } = getClient(socket);
      const res = await WsRedisController.getOnlineList(id);
      if (res) {
        const { data }: IData = JSON.parse(res);
        WsRedisController.live(id, {
          client_ip,
          created_at: new Date().toLocaleString(),
          exp: liveExp,
          data: data.userInfo,
        });
      }
    });

    // 用户进房间
    socket.on(wsMsgType.userInRoom, async (data: any) => {
      prettierLog('用户进房间', socket);
      const { id, client_ip } = getClient(socket);
      WsRedisController.live(id, {
        client_ip,
        created_at: new Date().toLocaleString(),
        exp: liveExp,
        data,
      });
      await Promise.all([
        data.userInfo.userType === wsUserType.user
          ? WsRedisController.addOnlineUser(id, {
              client_ip,
              created_at: new Date().toLocaleString(),
              data,
            })
          : WsRedisController.addOnlineVisitor(id, {
              client_ip,
              created_at: new Date().toLocaleString(),
              data,
            }),
        WsRedisController.addOnlineList(id, {
          client_ip,
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
      emitNum(client_ip);
    });

    // 用户退出房间
    socket.on(wsMsgType.userOutRoom, () => {
      prettierLog('用户退出房间', socket);
      WsRedisController.die(socket.id);
    });

    // 用户发送消息
    socket.on(wsMsgType.userSendMsg, (data) => {
      prettierLog('用户发送消息', socket);
      // socket.emit会将消息发送给发件人
      // socket.broadcast.emit会将消息发送给除了发件人以外的所有人
      // io.emit会将消息发送给所有人，包括发件人
      const { id, client_ip } = getClient(socket);
      io.emit(wsMsgType.userSendMsg, {
        id,
        userInfo: data.userInfo,
        value: data.value,
        created_at: new Date().toLocaleString(),
      });
      interactionController.common.create({
        client_ip,
        client: '',
        user_info: JSON.stringify(data.userInfo),
        user_type: data.userInfo.userType,
        type: wsMsgType.userSendMsg,
        value: JSON.stringify(data.value),
      });
    });

    // 游客切换头像
    socket.on(wsMsgType.visitorSwitchAvatar, (data) => {
      prettierLog('游客切换头像', socket);
      const { avatar } = data;
      io.emit(wsMsgType.visitorSwitchAvatar, {
        code: 200,
        avatar,
        created_at: new Date().toLocaleString(),
      });
    });

    // 点歌
    socket.on(wsMsgType.chooseSong, (data) => {
      prettierLog('点歌', socket);
      io.emit(wsMsgType.chooseSong, {
        code: 200,
        data,
        created_at: new Date().toLocaleString(),
      });
    });

    // 断开连接中
    socket.on(wsConnectStatus.disconnecting, (reason) => {
      prettierLog('断开连接中', socket);
      console.log(reason);
    });

    // 已断开连接
    socket.on(wsConnectStatus.disconnect, (reason) => {
      prettierLog('已断开连接', socket);
      console.log(reason);
      WsRedisController.die(socket.id);
    });
  });
};
