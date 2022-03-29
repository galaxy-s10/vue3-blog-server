import { createClient } from 'redis';

import { REDIS_CONFIG } from './secret';

import { chalkERROR, chalkINFO, chalkSUCCESS } from '@/app/chalkTip';

const redisClient = createClient({
  socket: {
    port: REDIS_CONFIG.socket.port,
    host: REDIS_CONFIG.socket.host,
  },
  password: REDIS_CONFIG.password,
});

export const connectRedis = async () => {
  redisClient.on('error', (err) => {
    console.log(err);
    console.log(chalkERROR('Redis Client Error'));
  });

  try {
    console.log(
      chalkINFO(
        `开始连接${REDIS_CONFIG.socket.host}:${REDIS_CONFIG.socket.port}服务器的redis...`
      )
    );
    await redisClient.connect();
    console.log(
      chalkSUCCESS(
        `连接${REDIS_CONFIG.socket.host}:${REDIS_CONFIG.socket.port}服务器的redis成功!`
      )
    );
  } catch (error) {
    console.log(error);
    console.log(
      chalkERROR(
        `连接${REDIS_CONFIG.socket.host}:${REDIS_CONFIG.socket.port}服务器的redis失败!`
      )
    );
  }
};

export default redisClient;
