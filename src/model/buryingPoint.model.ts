import {
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from 'sequelize';

import sequelize from '@/config/mysql';
import { IBuryingPoint } from '@/interface';
import { initTable } from '@/utils';

interface BuryingPointModel
  extends Model<
      InferAttributes<BuryingPointModel>,
      InferCreationAttributes<BuryingPointModel>
    >,
    IBuryingPoint {}

const model = sequelize.define<BuryingPointModel>(
  'burying_point',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    ip: {
      type: DataTypes.STRING(500),
    },
    article_id: {
      type: DataTypes.INTEGER,
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    user_agent: {
      // qq浏览器的user_agent能达到四百多字符
      type: DataTypes.STRING(500),
    },
    extend_field_a: {
      type: DataTypes.STRING(500),
    },
    extend_field_b: {
      type: DataTypes.STRING(500),
    },
    extend_field_c: {
      type: DataTypes.STRING(500),
    },
    extend_field_d: {
      type: DataTypes.STRING(500),
    },
    extend_field_e: {
      type: DataTypes.STRING(500),
    },
    extend_field_f: {
      type: DataTypes.STRING(500),
    },
    extend_field_g: {
      type: DataTypes.STRING(500),
    },
    remark: {
      type: DataTypes.STRING,
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
