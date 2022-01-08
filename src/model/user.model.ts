// https://github.com/demopark/sequelize-docs-Zh-CN/blob/master/core-concepts/model-basics.md#%E6%95%B0%E6%8D%AE%E7%B1%BB%E5%9E%8B
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
      unique: true,
      // unique: {
      //   name: '???',
      //   msg: '存在同名用户！',
      // },
      validate: {
        // 其实不管isUnique叫啥名字，都会执行。
        // 如果验证是异步的，则需要添加第二个参数done，在验证结束后执行done回调
        async isUnique(username, done) {
          const res = await User.findOne({ where: { username } });
          if (res) {
            done(new Error('存在同名用户！'));
          } else {
            done();
          }
        },
      },
    },
    password: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        /**
         * 不匹配[0-9]+$,即不匹配从头到尾都是数字
         * 不匹配[a-zA-Z]+$，即不匹配从头到尾都是字母
         * 匹配[0-9a-zA-Z]{8,16}，即只匹配数字和字母，最少8个最多16个
         * 总结：只匹配8到16位的数字和字母，且必须存在数字和字母。
         */
        // is: /(?![0-9]+$)(?![a-zA-Z]+$)[0-9a-zA-A]{8,16}/g,
        regPwd(value: string) {
          const reg = /(?![0-9]+$)(?![a-zA-Z]+$)[0-9a-zA-A]{8,16}/g;
          if (!reg.test(value)) {
            throw new Error('密码格式错误!');
          }
        },
      },
    },
    status: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    avatar: {
      type: DataTypes.STRING(150),
      defaultValue: null,
    },
    title: {
      type: DataTypes.STRING(50),
      defaultValue: '这个人很懒，什么也没有留下',
    },
    token: {
      type: DataTypes.TEXT,
      defaultValue: null,
    },
  },
  {
    hooks: {
      // https://github.com/demopark/sequelize-docs-Zh-CN/blob/master/other-topics/hooks.md
      afterValidate(User, options) {
        if (User.changed('password')) {
          User.password = MD5(User.password).toString();
        }
      },
    },
    // timestamps: false, // 将createdAt和updatedAt时间戳添加到模型中。默认为true。
    /**
     * 如果freezeTableName为true，sequelize将不会尝试更改DAO名称以获取表名。
     * 否则，dao名称将是复数的。默认为false。
     */
    freezeTableName: true,
  }
);

User.addHook('beforeCreate', () => {
  console.log('beforeCreate');
});

// User.sync({ force: true }).then((res) => {
//   console.log('将创建表,如果表已经存在,则将其首先删除', res);
// });
export default User;
