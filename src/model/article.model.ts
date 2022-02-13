// import Sequelize from 'sequelize';//这种写法没有提示。
// import * as Sequelize from 'sequelize'; // 这种写法有提示。
// import Sequelize = require('sequelize'); // 这种写法有提示。
import { DataTypes } from 'sequelize';
import sequelize from '@/config/db';
import { initTable } from '@/utils';

// const Sequelize = require('sequelize');

const articleModel = sequelize.define(
  // 这将控制自动生成的foreignKey和关联命名的名称
  'article', // 模型名称
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    desc: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    is_comment: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // 1:开启评论 2:关闭评论
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // 1:审核通过 2:未审核
    },
    head_img: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    content: {
      type: DataTypes.TEXT('long'),
      allowNull: false,
    },
    click: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    paranoid: true,
    freezeTableName: true, // 你可以使用 freezeTableName: true 参数停止 Sequelize 执行自动复数化. 这样,Sequelize 将推断表名称等于模型名称,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

initTable(articleModel);
export default articleModel;
