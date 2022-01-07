import { DataTypes } from 'sequelize';
import sequelize from '../config/db';

const Frontend = sequelize.define(
  'frontend',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    frontend_login: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    frontend_register: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    frontend_about: {
      type: DataTypes.STRING,
    },
    frontend_comment: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
  }
);

// Frontend.sync({ force: true }).then((res) => {
//   console.log('将创建表,如果表已经存在,则将其首先删除', res);
// });
export default Frontend;
