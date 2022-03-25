import { Sequelize } from 'sequelize';

import { mysqlConfig } from './secret';

import { chalkERROR, chalkINFO, chalkSUCCESS } from '@/app/chalkTip';

const sequelize = new Sequelize(
  mysqlConfig.database,
  mysqlConfig.username,
  mysqlConfig.password,
  {
    host: mysqlConfig.host,
    port: mysqlConfig.port,
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
export const connectDb = async () => {
  try {
    console.log(
      chalkINFO(
        `开始连接${mysqlConfig.host}:${mysqlConfig.port}服务器的${mysqlConfig.database}数据库...`
      )
    );
    await sequelize.authenticate();
    const okMsg = `连接${mysqlConfig.host}:${mysqlConfig.port}服务器的${mysqlConfig.database}数据库成功!`;
    console.log(chalkSUCCESS(okMsg));
  } catch (error) {
    const errMsg = `连接${mysqlConfig.host}:${mysqlConfig.port}服务器的${mysqlConfig.database}数据库失败!`;
    console.log(error);
    console.error(chalkERROR(errMsg));
    throw new Error(errMsg);
  }
};

export default sequelize;
