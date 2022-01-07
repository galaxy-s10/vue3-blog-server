import { DataTypes } from 'sequelize';
import sequelize from '../config/db';

const Log = sequelize.define(
  'log',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
    },
    api_ip: {
      type: DataTypes.STRING(50),
    },
    api_hostname: {
      type: DataTypes.STRING(50),
    },
    api_method: {
      type: DataTypes.STRING(20),
    },
    api_path: {
      type: DataTypes.STRING(50),
    },
    api_query: {
      type: DataTypes.STRING,
    },
    api_body: {
      type: DataTypes.STRING,
    },
  },
  {
    freezeTableName: true,
  }
);

// Log.sync({ force: true }).then((res) => {
//   console.log('将创建表,如果表已经存在,则将其首先删除', res);
// });
export default Log;
