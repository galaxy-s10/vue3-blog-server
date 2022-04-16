import { DataTypes } from 'sequelize';

import sequelize from '@/config/db';
import { initTable } from '@/utils';

const worksModel = sequelize.define(
  'works',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(100),
    },
    desc: {
      type: DataTypes.STRING(100),
    },
    bg_url: {
      type: DataTypes.STRING(100),
    },
    url: {
      type: DataTypes.STRING(100),
    },
    priority: {
      type: DataTypes.INTEGER, // 权重
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // 1:已审核 2:未审核
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

initTable(worksModel);
export default worksModel;
