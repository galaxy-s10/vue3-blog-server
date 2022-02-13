import { DataTypes } from 'sequelize';
import sequelize from '@/config/db';
import { initTable } from '@/utils';

const linkModel = sequelize.define(
  'link',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(100),
    },
    name: {
      type: DataTypes.STRING(100),
    },
    avatar: {
      type: DataTypes.STRING(100),
    },
    desc: {
      type: DataTypes.STRING(100),
    },
    url: {
      type: DataTypes.STRING(100),
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // 1:审核通过 2:未审核
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

initTable(linkModel);
export default linkModel;
