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
    qiniu_bucket: {
      type: DataTypes.STRING(50),
    },
    qiniu_key: {
      type: DataTypes.STRING(100),
    },
    qiniu_hash: {
      type: DataTypes.STRING(50),
    },
    qiniu_fsize: {
      type: DataTypes.STRING(50),
    },
    qiniu_mimeType: {
      type: DataTypes.STRING(50),
    },
    qiniu_putTime: {
      // 会返回：16511776862952760，超出DataTypes.INTEGER大小，可以使用DataTypes.BIGINT
      type: DataTypes.STRING(50),
    },
    qiniu_type: {
      type: DataTypes.STRING(50),
    },
    qiniu_status: {
      type: DataTypes.STRING(50),
    },
    qiniu_md5: {
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
