import { DataTypes } from 'sequelize';
import sequelize from '../config/db';

const VisitorLog = sequelize.define(
  'visitorLog',
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
    ip: {
      type: DataTypes.STRING(50),
    },
    state: {
      type: DataTypes.INTEGER,
    },
    data: {
      type: DataTypes.STRING(300),
    },
  },
  {
    freezeTableName: true,
  }
);

// VisitorLog.sync({ force: true }).then((res) => {
//   console.log('将创建表,如果表已经存在,则将其首先删除', res);
// });
export default VisitorLog;
