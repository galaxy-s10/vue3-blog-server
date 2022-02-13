import { DataTypes } from 'sequelize';
import sequelize from '@/config/db';
import { initTable } from '@/utils';

const frontendModel = sequelize.define(
  'frontend',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    frontend_login: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // -1:关闭站内登录 1:开启站内登录
    },
    frontend_register: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // -1:关闭站内注册 1:开启站内注册
    },
    frontend_qq_login: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // -1:关闭qq登录 1:开启qq登录
    },
    frontend_github_login: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // -1:关闭github登录 1:开启github登录
    },
    frontend_comment: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // -1:关闭留言 1:开启留言
    },
    frontend_link: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // -1:关闭申请友链 1:关闭申请友链
    },
    frontend_about: {
      type: DataTypes.TEXT('long'),
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

initTable(frontendModel);
export default frontendModel;
