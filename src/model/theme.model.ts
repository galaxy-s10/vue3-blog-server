// import Sequelize from 'sequelize';//这种写法没有提示。
// import * as Sequelize from 'sequelize'; // 这种写法有提示。
// import Sequelize = require('sequelize'); // 这种写法有提示。
import { DataTypes } from 'sequelize';

import sequelize from '@/config/db';
import { initTable } from '@/utils';

// const Sequelize = require('sequelize');

const themeModel = sequelize.define(
  // 这将控制自动生成的foreignKey和关联命名的名称
  'theme',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    model: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '模块名',
      // unique: true, // 唯一约束,如果尝试插入已存在的model,将抛出 SequelizeUniqueConstraintError.
    },
    key: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '变量key',
    },
    value: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: '变量value',
      // validate: {
      //   len: [3, 100],
      // },
    },
    lang: {
      type: DataTypes.STRING(50),
      allowNull: false,
      comment: '语言',
      // validate: {
      //   max: 50,
      // },
    },
  },
  {
    paranoid: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

initTable(themeModel);
export default themeModel;
