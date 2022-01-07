import { DataTypes } from 'sequelize';
import sequelize from '../config/db';

const Role = sequelize.define(
  'role',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    role_name: {
      type: DataTypes.STRING(50),
    },
    role_description: {
      type: DataTypes.STRING(50),
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
// Role.sync({ force: true }).then((res) => {
//   console.log('将创建表,如果表已经存在,则将其首先删除', res);
// });
export default Role;
