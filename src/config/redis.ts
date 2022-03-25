import { createClient } from 'redis';

import { redisConfig } from './secret';

import { chalkERROR, chalkINFO, chalkSUCCESS } from '@/app/chalkTip';

const redisClient = createClient({
  socket: {
    port: redisConfig.socket.port,
    host: redisConfig.socket.host,
  },
  password: redisConfig.password,
});

export const connectRedis = async () => {
  redisClient.on('error', (err) => {
    console.log(err);
    console.log(chalkERROR('Redis Client Error'));
  });

  try {
    console.log(
      chalkINFO(
        `开始连接${redisConfig.socket.host}:${redisConfig.socket.port}服务器的redis...`
      )
    );
    await redisClient.connect();
    console.log(
      chalkSUCCESS(
        `连接${redisConfig.socket.host}:${redisConfig.socket.port}服务器的redis成功!`
      )
    );
  } catch (error) {
    console.log(error);
    console.log(
      chalkERROR(
        `连接${redisConfig.socket.host}:${redisConfig.socket.port}服务器的redis失败!`
      )
    );
  }
};

export default redisClient;
