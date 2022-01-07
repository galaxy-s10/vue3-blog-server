// import Sequelize from 'sequelize';//这种写法没有提示。
// import * as Sequelize from 'sequelize'; // 这种写法有提示。
// import Sequelize = require('sequelize'); // 这种写法有提示。
import { DataTypes } from 'sequelize';
import sequelize from '../config/db';

// const Sequelize = require('sequelize');

const Article = sequelize.define(
  // 这将控制自动生成的foreignKey和关联命名的名称
  'article',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    title: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    is_comment: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // 1开启，2关闭
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1, // 1正常，2非法
    },
    img: {
      type: DataTypes.STRING(150),
      defaultValue: null,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    click: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    freezeTableName: true,
  }
);
// Article.sync({ force: true }).then((res) => {
//   console.log('将创建表,如果表已经存在,则将其首先删除', res);
// });
export default Article;
