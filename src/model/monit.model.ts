import { DataTypes } from 'sequelize';

import sequelize from '@/config/db';
import { initTable } from '@/utils';

const monitModel = sequelize.define(
  'monit',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    type: {
      type: DataTypes.INTEGER,
    },
    info: {
      type: DataTypes.TEXT('long'),
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

initTable(monitModel);
export default monitModel;
