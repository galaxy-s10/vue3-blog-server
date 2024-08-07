import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { IVisitorLog } from '@/interface';
import { initTable } from '@/utils';

interface VisitorLogModel
  extends Model<
      InferAttributes<VisitorLogModel>,
      InferCreationAttributes<VisitorLogModel>
    >,
    IVisitorLog {}

const model = sequelize.define<VisitorLogModel>(
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
      type: DataTypes.STRING(500),
    },
    ip_data: {
      type: DataTypes.STRING(500),
    },
    page_url: {
      type: DataTypes.STRING(500),
    },
    user_agent: {
      // qq浏览器的user_agent能达到四百多字符
      type: DataTypes.STRING(500),
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

initTable({ model, sequelize });
export default model;
