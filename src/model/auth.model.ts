import { DataTypes } from 'sequelize';
import sequelize from '../config/db';

const Auth = sequelize.define(
  'auth',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    auth_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    auth_description: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    p_id: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
  }
);

// Auth.sync({ force: true }).then((res) => {
//   console.log('将创建表,如果表已经存在,则将其首先删除', res);
// });
export default Auth;
