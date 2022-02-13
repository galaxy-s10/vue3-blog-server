import { DataTypes } from 'sequelize';
import sequelize from '@/config/db';
import { initTable } from '@/utils';

const userArticleModel = sequelize.define(
  'user_article',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      // references: {
      //   model: userModel,
      //   key: 'id',
      // },
    },
    article_id: {
      type: DataTypes.INTEGER,
      // references: {
      //   model: articleModel,
      //   key: 'id',
      // },
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

initTable(userArticleModel);
export default userArticleModel;
