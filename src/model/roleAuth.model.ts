import { DataTypes } from 'sequelize';
import sequelize from '../config/db';

const RoleAuth = sequelize.define(
  'roleAuth',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    role_id: {
      type: DataTypes.INTEGER,
    },
    auth_id: {
      type: DataTypes.INTEGER,
    },
  },
  {
    freezeTableName: true,
  }
);
// RoleAuth.sync({ force: true }).then((res) => {
//   console.log('将创建表,如果表已经存在,则将其首先删除', res);
// });
export default RoleAuth;
