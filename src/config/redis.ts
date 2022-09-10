import { createClient } from 'redis';

import { REDIS_CONFIG } from './secret';

import { chalkERROR, chalkINFO, chalkSUCCESS } from '@/utils/chalkTip';

const redisClient = createClient({
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
    console.log(chalkSUCCESS(msg(true)));
  } catch (error) {
    console.log(chalkERROR(msg(false)));
    console.log(error);
    throw new Error(msg(false));
  }
};

export default redisClient;
