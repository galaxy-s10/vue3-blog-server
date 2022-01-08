// import Sequelize = require('sequelize');
import { Sequelize } from 'sequelize';

import { _ERROR, _SUCCESS } from '@/app/chalkTip';

import { mysqlConfig } from './secret';

// const Sequelize = require('sequelize');

const sequelize = new Sequelize(
  mysqlConfig.database,
  mysqlConfig.username,
  mysqlConfig.password,
  {
    host: mysqlConfig.host,
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
sequelize
  .authenticate()
  .then(() => {
    console.log(_SUCCESS('连接数据库成功'));
  })
  .catch((err) => {
    console.error(_ERROR('连接数据库失败'), err);
  });
export default sequelize;
