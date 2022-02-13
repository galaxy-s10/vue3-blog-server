import { DataTypes } from 'sequelize';
import sequelize from '@/config/db';
import { initTable } from '@/utils';

const logModel = sequelize.define(
  'log',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      defaultValue: -1, // -1:游客 非-1:用户
    },
    api_user_agent: {
      type: DataTypes.STRING,
    },
    api_from: {
      type: DataTypes.INTEGER, // 1:前台 2:后台
    },
    api_ip: {
      type: DataTypes.STRING(50),
    },
    api_hostname: {
      type: DataTypes.STRING(100),
    },
    api_method: {
      type: DataTypes.STRING(20),
    },
    api_path: {
      type: DataTypes.STRING(100),
    },
    api_query: {
      type: DataTypes.STRING,
    },
    api_body: {
      type: DataTypes.TEXT('long'),
    },
    api_err_msg: {
      type: DataTypes.STRING,
    },
    api_err_stack: {
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

initTable(logModel);
export default logModel;
