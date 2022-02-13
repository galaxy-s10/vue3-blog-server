import { DataTypes } from 'sequelize';
import sequelize from '@/config/db';
import { initTable } from '@/utils';

const roleModel = sequelize.define(
  'role',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    role_name: {
      type: DataTypes.STRING(50),
    },
    role_description: {
      type: DataTypes.STRING(50),
    },
    p_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0, // 0:最外层的父级
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

initTable(roleModel);
export default roleModel;
