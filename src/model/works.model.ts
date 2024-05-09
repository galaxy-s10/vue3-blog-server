import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { IWorks } from '@/interface';
import { initTable } from '@/utils';

interface WorksModel
  extends Model<
      InferAttributes<WorksModel>,
      InferCreationAttributes<WorksModel>
    >,
    IWorks {}

const model = sequelize.define<WorksModel>(
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
      type: DataTypes.STRING(300),
    },
    url: {
      type: DataTypes.STRING(300),
    },
    priority: {
      type: DataTypes.INTEGER,
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

initTable({ model, sequelize });
export default model;
