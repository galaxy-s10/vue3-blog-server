// 一定要将import './init';放到最开头,因为它里面初始化了路径别名
import './init/alias';
import './init/initFile';

import { performance } from 'perf_hooks';

import { connectMysql } from '@/config/mysql';
import { connectRedis } from '@/config/redis';
import { createPubSub } from '@/config/redis/pub';
import { PROJECT_ENV, PROJECT_NAME, PROJECT_PORT } from '@/constant';
import { MYSQL_CONFIG } from '@/secret/secret';
import { getIpAddress } from '@/utils';
import { chalkERROR, chalkSUCCESS, chalkWARN } from '@/utils/chalkTip';

const start = performance.now();

async function main() {
  try {
    await Promise.all([
      connectMysql(), // 连接mysql
      connectRedis(), // 连接redis
      createPubSub(), // 创建redis的发布订阅
    ]);
    const port = +PROJECT_PORT;
    await (await import('./setup')).setupKoa({ port });
    console.log();

    console.log(chalkWARN(`监听端口: ${port}`));
    console.log(chalkWARN(`项目名称: ${PROJECT_NAME}`));
    console.log(chalkWARN(`项目环境: ${PROJECT_ENV}`));
    console.log(chalkWARN(`mysql数据库: ${MYSQL_CONFIG.database}`));
    getIpAddress().forEach((ip) => {
      console.log(chalkSUCCESS(`http://${ip}:${port}/`));
    });
    console.log(
      chalkSUCCESS(
        `项目启动成功！耗时：${Math.floor(performance.now() - start)}ms`
      )
    );
    console.log();
  } catch (error) {
    console.log(chalkERROR(`项目启动失败！`));
    console.log(error);
  }
}

main();
