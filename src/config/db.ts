// import Sequelize = require('sequelize');
import { Sequelize } from 'sequelize';

import { mysqlConfig } from './secret';

import { chalkERROR, chalkINFO, chalkSUCCESS } from '@/app/chalkTip';
import { deleteAllForeignKeys, deleteAllIndexs } from '@/utils/index';

const fs = require('fs');

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

/**
 * 加载所有model
 */
const loadAllModel = () => {
  const modelDir = `${process.cwd()}/src/model`;
  fs.readdirSync(modelDir).forEach((file: string) => {
    if (file.indexOf('.model.ts') === -1) return;
    // eslint-disable-next-line
    require(`${modelDir}/${file}`).default;
  });
  console.log(chalkSUCCESS(`加载所有model成功~`));
};

/**
 * 删除所有表
 */
const deleteAllTable = async () => {
  try {
    loadAllModel();
    await sequelize.drop();
    console.log(chalkSUCCESS('删除所有表成功!'));
  } catch (err) {
    console.log(chalkERROR('删除所有表失败!'));
  }
};

/**
 * 初始化数据库：
 * 1：重置所有
 * 2：校正现有数据库
 */
const init = async (v) => {
  try {
    switch (v) {
      case 1:
        await deleteAllForeignKeys();
        await deleteAllIndexs();
        await deleteAllTable();
        loadAllModel();
        await sequelize.sync({ force: true }); // 将创建表,如果表已经存在,则将其首先删除
        console.log(chalkSUCCESS('初始化数据库所有表完成!'));
        break;
      case 2:
        loadAllModel();
        // eslint-disable-next-line global-require
        require('@/model/relation');
        await sequelize.sync({ alter: true }); // 这将检查数据库中表的当前状态(它具有哪些列,它们的数据类型等),然后在表中进行必要的更改以使其与模型匹配.
        console.log(chalkSUCCESS('校正数据库所有表完成!'));
        break;
      case 3:
      default:
        loadAllModel();
        // eslint-disable-next-line global-require
        require('@/model/relation');
        break;
    }
  } catch (err) {
    console.log(chalkERROR('初始化失败!'), err);
  }
};

(async () => {
  console.log(
    chalkINFO(`开始连接${mysqlConfig.host}的${mysqlConfig.database}数据库...`)
  );
  try {
    await sequelize.authenticate();
    console.log(
      chalkSUCCESS(
        `连接${mysqlConfig.host}的${mysqlConfig.database}数据库成功!`
      )
    );
    // init(1); //初始化数据库
    // init(2); //校正数据库
    init(3);
  } catch (err) {
    console.error(
      chalkERROR(`连接${mysqlConfig.host}的${mysqlConfig.database}数据库失败!`),
      err
    );
  }
})();

export default sequelize;
