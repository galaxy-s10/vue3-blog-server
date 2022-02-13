import { DataTypes } from 'sequelize';
import sequelize from '@/config/db';
import { initTable } from '@/utils';

const commentModel = sequelize.define(
  'comment',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    article_id: {
      type: DataTypes.INTEGER,
      defaultValue: -1, // -1:留言板的评论 非-1:文章的评论
    },
    to_comment_id: {
      type: DataTypes.INTEGER,
      defaultValue: -1, // -1:楼主 非-1:
    },
    from_user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    to_user_id: {
      type: DataTypes.INTEGER,
      defaultValue: -1, // -1:楼主 非-1:在楼主下回复的用户
    },
    content: {
      type: DataTypes.TEXT('long'),
    },
    children_comment_total: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    ua: {
      type: DataTypes.STRING,
    },
    ip: {
      type: DataTypes.STRING,
    },
    ip_data: {
      type: DataTypes.STRING,
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

initTable(commentModel);
export default commentModel;
