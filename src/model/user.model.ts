import { DataTypes } from 'sequelize';
import sequelize from '../config/db';

const MD5 = require('crypto-js/md5');

const User = sequelize.define(
  'user',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    avatar: {
      type: DataTypes.STRING(100),
      defaultValue: null,
    },
    title: {
      type: DataTypes.STRING(50),
      defaultValue: '这个人很懒，什么也没有留下',
    },
    token: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
  },
  {
    hooks: {
      afterValidate(User, options) {
        if (User.changed('password')) {
          User.password = MD5(User.password).toString();
        }
      },
    },
    // timestamps: false,
    freezeTableName: true,
  }
);

User.addHook('beforeCreate', () => {
  console.log('kkkkkk');
});

// User.sync({ force: true }).then((res) => {
//   console.log('将创建表,如果表已经存在,则将其首先删除', res);
// });
export default User;
