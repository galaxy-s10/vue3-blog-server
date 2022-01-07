import { DataTypes } from 'sequelize';
import sequelize from '../config/db';

const Link = sequelize.define(
  'link',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    ip: {
      type: DataTypes.STRING(50),
    },
    email: {
      type: DataTypes.STRING(100),
    },
    name: {
      type: DataTypes.STRING(50),
    },
    avatar: {
      type: DataTypes.STRING(100),
    },
    description: {
      type: DataTypes.STRING(50),
    },
    url: {
      type: DataTypes.STRING(100),
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
  },
  {
    freezeTableName: true,
  }
);

// Link.sync({ force: true }).then((res) => {
//   console.log('将创建表,如果表已经存在,则将其首先删除', res);
// });
export default Link;
