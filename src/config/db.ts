import { Sequelize } from 'sequelize';

import { MYSQL_CONFIG } from './secret';

import { PROJECT_ENV } from '@/constant';
import { chalkERROR, chalkINFO, chalkSUCCESS } from '@/utils/chalkTip';

export const dbName =
  PROJECT_ENV !== 'prod'
    ? `${MYSQL_CONFIG.database}_test`
    : MYSQL_CONFIG.database;

const sequelize = new Sequelize(
  dbName,
  MYSQL_CONFIG.username,
  MYSQL_CONFIG.password,
  {
    host: MYSQL_CONFIG.host,
    port: MYSQL_CONFIG.port,
    dialect: 'mysql',
    dialectOptions: {
      // 返回正确的时间戳字符串。
      dateStrings: true,
      typeCast: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    timezone: '+08:00',
  }
);

/** 连接数据库 */
export const connectMysql = async () => {
  const msg = (flag: boolean) =>
    `连接${MYSQL_CONFIG.host}:${MYSQL_CONFIG.port}服务器的${dbName}数据库${
      flag ? '成功' : '失败'
    }！`;

  try {
    console.log(
      chalkINFO(
        `开始连接${MYSQL_CONFIG.host}:${MYSQL_CONFIG.port}服务器的${dbName}数据库...`
      )
    );
    await sequelize.authenticate({ logging: false });
    console.log(chalkSUCCESS(msg(true)));
  } catch (error) {
    console.log(chalkERROR(msg(false)));
    console.log(error);
    throw new Error(msg(false));
  }
};

export default sequelize;
