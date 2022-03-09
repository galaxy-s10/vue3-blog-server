import { DataTypes } from 'sequelize';
import sequelize from '@/config/db';
import { initTable } from '@/utils';

const roleAuthModel = sequelize.define(
  'role_auth',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
    },
    auth_id: {
      type: DataTypes.INTEGER,
    },
  },
  {
    indexes: [
      {
        name: 'role_id',
        fields: ['role_id'],
      },
      {
        name: 'auth_id',
        fields: ['auth_id'],
      },
    ],
    paranoid: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

initTable(roleAuthModel);
export default roleAuthModel;
