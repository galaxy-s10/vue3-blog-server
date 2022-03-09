import { DataTypes } from 'sequelize';
import sequelize from '@/config/db';
import { initTable } from '@/utils';

const visitorLogModel = sequelize.define(
  'visitor_log',
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
    ip: {
      type: DataTypes.STRING(50),
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // -1:非法 1:正常
    },
    ip_data: {
      type: DataTypes.STRING,
    },
  },
  {
    indexes: [
      {
        name: 'user_id',
        fields: ['user_id'],
      },
    ],
    paranoid: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

initTable(visitorLogModel);
export default visitorLogModel;
