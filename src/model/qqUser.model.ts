import { DataTypes } from 'sequelize';

import sequelize from '@/config/db';
import { initTable } from '@/utils';

const qqUserModel = sequelize.define(
  'qq_user',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true,
    },
    client_id: {
      // 其实就是appid
      type: DataTypes.INTEGER,
    },
    openid: {
      type: DataTypes.STRING,
    },
    unionid: {
      type: DataTypes.STRING,
    },
    // https://wiki.connect.qq.com/%E4%BD%BF%E7%94%A8authorization_code%E8%8E%B7%E5%8F%96access_token
    // access_token: {
    //   type: DataTypes.TEXT('long'),
    // },
    // expires_in: {
    //   // 该access token的有效期，单位为秒。
    //   type: DataTypes.STRING,
    // },
    // refresh_token: {
    //   type: DataTypes.TEXT('long'),
    // },
    nickname: {
      type: DataTypes.STRING,
    },
    figureurl: {
      // 大小为30×30像素的QQ空间头像URL。
      type: DataTypes.STRING,
    },
    figureurl_1: {
      // 大小为50×50像素的QQ空间头像URL。
      type: DataTypes.STRING,
    },
    figureurl_2: {
      // 大小为100×100像素的QQ空间头像URL。
      type: DataTypes.STRING,
    },
    figureurl_qq_1: {
      // 大小为40×40像素的QQ头像URL。
      type: DataTypes.STRING,
    },
    figureurl_qq_2: {
      // 大小为100×100像素的QQ头像URL。需要注意，不是所有的用户都拥有QQ的100x100的头像，但40x40像素则是一定会有
      type: DataTypes.STRING,
    },
    constellation: {
      // 星座
      type: DataTypes.STRING,
    },
    gender: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
    province: {
      type: DataTypes.STRING,
    },
    year: {
      type: DataTypes.STRING,
    },
  },
  {
    paranoid: true,
    freezeTableName: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
  }
);

initTable(qqUserModel);
export default qqUserModel;
