import { DataTypes } from 'sequelize';
import sequelize from '../config/db';

const QiniuData = sequelize.define(
  'qiniuData',
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
    bucket: {
      type: DataTypes.STRING(50),
    },
    fsize: {
      type: DataTypes.INTEGER,
    },
    mimeType: {
      type: DataTypes.STRING(50),
    },
    hash: {
      type: DataTypes.STRING(50),
    },
    key: {
      type: DataTypes.STRING(50),
    },
  },
  {
    freezeTableName: true,
  }
);

// QiniuData.sync({ force: true }).then((res) => {
//   console.log('将创建表,如果表已经存在,则将其首先删除', res);
// });
export default QiniuData;
