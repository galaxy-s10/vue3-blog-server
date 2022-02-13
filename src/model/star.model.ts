import { DataTypes } from 'sequelize';
import sequelize from '@/config/db';
import { initTable } from '@/utils';

const starModel = sequelize.define(
  'star',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    article_id: {
      type: DataTypes.INTEGER,
      defaultValue: -1, // -1:给用户的star 非-1:给这篇文章的star
    },
    comment_id: {
      type: DataTypes.INTEGER,
      defaultValue: -1, // -1:给文章的star 非-1:给这条评论的star
    },
    from_user_id: {
      type: DataTypes.INTEGER,
    },
    to_user_id: {
      type: DataTypes.INTEGER,
      defaultValue: -1, // -1:给文章的star 非-1:给这个用户star
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

initTable(starModel);
export default starModel;
