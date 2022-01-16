import { DataTypes } from 'sequelize';
import sequelize from '../config/db';

const DayData = sequelize.define(
  'dayData',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    today: {
      type: DataTypes.STRING(50),
    },
  },
  {
    timestamps: false,
    freezeTableName: true,
  }
);

// DayData.sync({ force: true }).then((res) => {
//   console.log('将创建表,如果表已经存在,则将其首先删除', res);
// });
export default DayData;
