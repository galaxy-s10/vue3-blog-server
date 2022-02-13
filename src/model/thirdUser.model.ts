import { DataTypes } from 'sequelize';
import sequelize from '@/config/db';
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
      type: DataTypes.STRING,
      allowNull: false,
    },
    third_platform: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1, // 1:博客 2:qq 3:github
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

initTable(thirdUserModel);
export default thirdUserModel;
