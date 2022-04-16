import { DataTypes } from 'sequelize';

import sequelize from '@/config/db';
import { initTable } from '@/utils';

const musicModel = sequelize.define(
  'music',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
    },
    cover_pic: {
      type: DataTypes.STRING(100),
    },
    author: {
      type: DataTypes.STRING(50),
    },
    audio_url: {
      type: DataTypes.STRING(100),
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 2, // 1:已审核 2:未审核
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

initTable(musicModel);
export default musicModel;
