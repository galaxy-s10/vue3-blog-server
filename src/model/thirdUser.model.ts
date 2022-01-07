import { DataTypes } from 'sequelize';
import sequelize from '../config/db';

const ThirdUser = sequelize.define(
  'thirdUser',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    userid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    platform: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    platform_openid: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    platform_token: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
  },
  {
    freezeTableName: true,
  }
);

// ThirdUser.sync({ force: true }).then((res) => {
//   console.log('将创建表,如果表已经存在,则将其首先删除', res);
// });
export default ThirdUser;
