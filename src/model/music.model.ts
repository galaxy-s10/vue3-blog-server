import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { IMusic } from '@/interface';
import { initTable } from '@/utils';

interface MusicModel
  extends Model<
      InferAttributes<MusicModel>,
      InferCreationAttributes<MusicModel>
    >,
    IMusic {}

const model = sequelize.define<MusicModel>(
  'music',
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
    cover_pic: {
      type: DataTypes.STRING(300),
    },
    author: {
      type: DataTypes.STRING(100),
    },
    audio_url: {
      type: DataTypes.STRING(300),
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 2, // 1:已审核 2:未审核
    },
    priority: {
      type: DataTypes.INTEGER,
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

initTable({ model, sequelize });
export default model;
