import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { IBackend } from '@/interface';
import { initTable } from '@/utils';

interface BackendModel
  extends Model<
      InferAttributes<BackendModel>,
      InferCreationAttributes<BackendModel>
    >,
    IBackend {}

const model = sequelize.define<BackendModel>(
  'backend',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    desc: {
      type: DataTypes.STRING,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
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
