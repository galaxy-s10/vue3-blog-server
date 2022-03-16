import { DataTypes } from 'sequelize';

import sequelize from '@/config/db';
import { initTable } from '@/utils';

const qiniuDataModel = sequelize.define(
  'qiniu_data',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    bucket: {
      type: DataTypes.STRING(50),
    },
    fsize: {
      type: DataTypes.INTEGER,
    },
    mimeType: {
      type: DataTypes.STRING(50),
    },
    hash: {
      type: DataTypes.STRING(50),
    },
    key: {
      type: DataTypes.STRING(50),
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

initTable(qiniuDataModel);
export default qiniuDataModel;
