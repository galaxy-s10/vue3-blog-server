import fs from 'fs';

import { Sequelize } from 'sequelize';
import { Model, ModelStatic } from 'sequelize/types';

import { PROJECT_ENV, PROJECT_ENV_ENUM, PROJECT_NODE_ENV } from '@/constant';
import {
  chalkERROR,
  chalkINFO,
  chalkSUCCESS,
  chalkWARN,
} from '@/utils/chalkTip';

/** 加载所有model */
export const loadAllModel = () => {
  const modelDir = `${process.cwd()}/${
    PROJECT_ENV === PROJECT_ENV_ENUM.prod ? 'dist' : 'src'
  }/model`;
  fs.readdirSync(modelDir).forEach((file: string) => {
    if (PROJECT_NODE_ENV === 'development') {
      if (file.indexOf('.model.ts') === -1) return;
    } else if (file.indexOf('.model.js') === -1) return;

    // eslint-disable-next-line
    require(`${modelDir}/${file}`).default;
  });
  console.log(chalkSUCCESS(`加载所有model完成~`));
};

/** 删除所有表 */
export const deleteAllTable = async (sequelizeInst: Sequelize) => {
  try {
    loadAllModel();
    await sequelizeInst.drop();
    console.log(chalkSUCCESS('删除所有表成功！'));
  } catch (err) {
    console.log(chalkERROR('删除所有表失败！'));
  }
};

/** 删除外键 */
export const deleteForeignKeys = async (data: {
  sequelizeInst: Sequelize;
  model?: ModelStatic<Model>;
}) => {
  try {
    const { sequelizeInst, model } = data;
    const queryInterface = sequelizeInst.getQueryInterface();
    let allTables: string[] = [];
    if (model) {
      allTables = [model.name];
    } else {
      allTables = await queryInterface.showAllTables();
    }
    console.log(chalkWARN(`需要删除外键的表:${allTables.toString()}`));
    const allIndexs: any = [];
    allTables.forEach((v) => {
      allIndexs.push(queryInterface.showIndex(v));
    });
    const allConstraint: any = [];
    allTables.forEach((v) => {
      allConstraint.push(queryInterface.getForeignKeysForTables([v]));
    });
    const res1 = await Promise.all(allConstraint);
    const allConstraint1: any = [];
    res1.forEach((v) => {
      const tableName = Object.keys(v)[0];
      const constraint: string[] = v[tableName];
      constraint.forEach((item) => {
        allConstraint1.push(queryInterface.removeConstraint(tableName, item));
      });
      console.log(chalkINFO(`${tableName}表的外键: ${constraint.toString()}`));
    });
    await Promise.all(allConstraint1);
    console.log(chalkSUCCESS(`删除${allTables.toString()}表的外键成功！`));
  } catch (err) {
    console.log(chalkERROR(`删除外键失败！`), err);
  }
};

/** 删除索引（除了PRIMARY） */
export const deleteIndexs = async (data: {
  sequelizeInst: Sequelize;
  model?: ModelStatic<Model>;
}) => {
  try {
    const { sequelizeInst, model } = data;
    const queryInterface = sequelizeInst.getQueryInterface();
    let allTables: string[] = [];
    if (model) {
      allTables = [model.name];
    } else {
      allTables = await queryInterface.showAllTables();
    }
    console.log(chalkWARN(`需要删除索引的表:${allTables.toString()}`));
    const allIndexs: any = [];
    allTables.forEach((v) => {
      allIndexs.push(queryInterface.showIndex(v));
    });
    const res1 = await Promise.all(allIndexs);
    const allIndexs1: any = [];
    res1.forEach((v: any[]) => {
      const { tableName }: { tableName: string } = v[0];
      const indexStrArr: string[] = [];
      v.forEach((x) => {
        indexStrArr.push(x.name);
        if (x.name !== 'PRIMARY') {
          allIndexs1.push(queryInterface.removeIndex(tableName, x.name));
        }
      });
      console.log(chalkINFO(`${tableName}表的索引: ${indexStrArr.toString()}`));
    });
    await Promise.all(allIndexs1);
    console.log(chalkSUCCESS(`删除${allTables.toString()}表的索引成功！`));
  } catch (err) {
    console.log(chalkERROR(`删除索引失败！`), err);
  }
};

/**
 * 初始化数据库：
 * force:重置所有
 * alert:校正现有数据库
 * load:加载数据库表
 */
export const initDb = async (
  type: 'force' | 'alert' | 'load',
  sequelizeInst: Sequelize
) => {
  switch (type) {
    case 'force':
      console.log(chalkWARN('开始初始化数据库所有表'));
      await deleteForeignKeys({ sequelizeInst });
      await deleteIndexs({ sequelizeInst });
      await deleteAllTable(sequelizeInst);
      await sequelizeInst.sync({ force: true }); // 将创建表,如果表已经存在,则将其首先删除
      console.log(chalkSUCCESS('初始化数据库所有表完成！'));
      break;
    case 'alert':
      console.log(chalkWARN('开始校正数据库所有表'));
      require('@/model/relation');
      await sequelizeInst.sync({ alter: true }); // 这将检查数据库中表的当前状态(它具有哪些列,它们的数据类型等),然后在表中进行必要的更改以使其与模型匹配.
      console.log(chalkSUCCESS('校正数据库所有表完成！'));
      break;
    case 'load':
      require('@/model/relation');
      break;
    default:
      throw new Error('initDb参数不正确！');
  }
};
