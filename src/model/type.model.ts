import { DataTypes } from 'sequelize';

import sequelize from '@/config/db';
import { initTable } from '@/utils';

const typeModel = sequelize.define(
  'type',
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
  },
  {
    paranoid: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

initTable(typeModel);
export default typeModel;
