import { DataTypes } from 'sequelize';
import sequelize from '../config/db';

const Star = sequelize.define(
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
      defaultValue: -1,
    },
    comment_id: {
      type: DataTypes.INTEGER,
      defaultValue: -1,
    },
    from_user_id: {
      type: DataTypes.INTEGER,
      defaultValue: -1,
    },
    to_user_id: {
      type: DataTypes.INTEGER,
      defaultValue: -1,
    },
  },
  {
    freezeTableName: true,
  }
);
// Star.sync({ force: true }).then((res) => {
//   console.log('将创建表,如果表已经存在,则将其首先删除', res);
// });
export default Star;
