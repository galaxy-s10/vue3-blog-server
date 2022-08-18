import { DataTypes } from 'sequelize';

import sequelize from '@/config/db';
import { THIRD_PLATFORM } from '@/constant';
import { initTable } from '@/utils';

const thirdUserModel = sequelize.define(
  'third_user',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    third_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    third_platform: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: THIRD_PLATFORM.website,
    },
  },
  {
    indexes: [
      {
        name: 'user_id',
        fields: ['user_id'],
      },
      {
        name: 'third_user_id',
        fields: ['third_user_id'],
      },
    ],
    paranoid: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

initTable(thirdUserModel);
export default thirdUserModel;
