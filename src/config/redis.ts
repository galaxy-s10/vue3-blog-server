import { createClient } from 'redis';

import { REDIS_CONFIG } from './secret';

import { chalkERROR, chalkINFO, chalkSUCCESS } from '@/utils/chalkTip';

const redisClient = createClient({
  // database: 0,
  socket: {
    port: REDIS_CONFIG.socket.port,
    host: REDIS_CONFIG.socket.host,
  },
  password: REDIS_CONFIG.password,
});

export const connectRedis = async () => {
  const msg = (flag: boolean) =>
    `连接${REDIS_CONFIG.socket.host}:${REDIS_CONFIG.socket.port}服务器的redis${
      flag ? '成功' : '失败'
    }！`;

  // redisClient.configSet('notify-keyspace-events', 'Ex').then((res) => {
  // console.log('开启过期通知成功', res);

  // redisClient.set('aaa', 'bbb');
  // redisClient.expire('aaa', 4);

  // const redisClient2 = createClient({
  //   socket: {
  //     port: REDIS_CONFIG.socket.port,
  //     host: REDIS_CONFIG.socket.host,
  //   },
  //   password: REDIS_CONFIG.password,
  // });
  // const expired_subKey = `__keyevent@0__:expired`;

  // redisClient.subscribe(expired_subKey, function () {
  //   console.log('::::::');
  //   redisClient.on('message', function (info, msg) {
  //     console.log(info, msg);
  //   });
  // });

  // });

  // const subscriber = redisClient.duplicate();
  // subscriber.connect().then((res) => {
  //   console.log('subscriber.connect', res);
  //   redisClient.subscribe(
  //     'vue3-blog-server-beta-emailLogin-274751790@qq.com',
  //     () => {
  //       console.log('emailLogin');
  //       // pmessage
  //     }
  //   );
  // });

  redisClient.on('error', (err) => {
    console.log(chalkERROR(msg(false)));
    console.log(err);
  });

  try {
    console.log(
      chalkINFO(
        `开始连接${REDIS_CONFIG.socket.host}:${REDIS_CONFIG.socket.port}服务器的redis...`
      )
    );
    await redisClient.connect();
    const res1 = await redisClient.configSet('notify-keyspace-events', 'Ex');
    const res = await redisClient.configGet('notify-keyspace-events');
    console.log('过期通知', res);
    console.log(chalkSUCCESS(msg(true)));
    return redisClient;
  } catch (error) {
    console.log(chalkERROR(msg(false)));
    console.log(error);
    throw new Error(msg(false));
  }
};

export default redisClient;
