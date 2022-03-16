import { DataTypes } from 'sequelize';

import sequelize from '@/config/db';
import { initTable } from '@/utils';

const articleTypeModel = sequelize.define(
  'article_type',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    article_id: {
      type: DataTypes.INTEGER,
    },
    type_id: {
      type: DataTypes.INTEGER,
    },
  },
  {
    indexes: [
      {
        name: 'article_id',
        fields: ['article_id'],
      },
      {
        name: 'type_id',
        fields: ['type_id'],
      },
    ],
    paranoid: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);
initTable(articleTypeModel);
export default articleTypeModel;
