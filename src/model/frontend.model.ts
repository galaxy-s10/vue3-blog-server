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
      // 废弃
      type: DataTypes.INTEGER,
      defaultValue: 1, // 1:关闭站内登录 2:开启站内登录
    },
    frontend_register: {
      // 废弃
      type: DataTypes.INTEGER,
      defaultValue: 1, // 1:关闭站内注册 2:开启站内注册
    },
    frontend_qq_login: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // 1:关闭qq登录 2:开启qq登录
    },
    frontend_github_login: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // 1:关闭github登录 2:开启github登录
    },
    frontend_email_login: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // 1:关闭email登录 2:开启email登录
    },
    frontend_comment: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // 1:关闭留言 2:开启留言
    },
    frontend_link: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // 1:关闭申请友链 2:关闭申请友链
    },
    frontend_dialog: {
      type: DataTypes.INTEGER,
      defaultValue: 2, // 1:开启首页弹窗 2:关闭首页弹窗
    },
    frontend_dialog_content: {
      // 首页弹窗内容
      type: DataTypes.TEXT('long'),
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
