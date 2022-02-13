import { DataTypes } from 'sequelize';
import sequelize from '@/config/db';
import { initTable } from '@/utils';

const dayDataModel = sequelize.define(
  'day_data',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    today: {
      type: DataTypes.DATE,
    },
  },
  {
    // indexes: [
    //   {
    //     name: 'today',
    //     fields: ['today'],
    //   },
    // ],
    paranoid: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

initTable(dayDataModel);
export default dayDataModel;
