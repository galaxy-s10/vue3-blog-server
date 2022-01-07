import { DataTypes } from 'sequelize';
import sequelize from '../config/db';

const Tag = sequelize.define(
  'tag',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(50),
    },
    color: {
      type: DataTypes.STRING(50),
    },
  },
  {
    freezeTableName: true,
  }
);
// Tag.sync({ force: true }).then((res) => {
//   console.log('将创建表,如果表已经存在,则将其首先删除', res);
// });
export default Tag;
