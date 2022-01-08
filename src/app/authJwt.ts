import jwt from 'jsonwebtoken';
import { jwtSecret } from '@/config/secret';
import User from '@/model/user.model';
import getUserStatus from './getUserStatus';

// const jwt = require('jsonwebtoken');

const authJwt = (req): Promise<{ code: number; message: string }> => {
  return new Promise((resolve, reject) => {
    // 首先判断请求头有没有authorization
    if (req.headers.authorization === undefined) {
      resolve({ code: 401, message: '未登录!' });
      return;
    }
    const token = req.headers.authorization?.split(' ')[1];
    jwt.verify(token, jwtSecret, {}, async (err, decode) => {
      console.log(decode, 986);
      if (err) {
        // 判断非法/过期token
        resolve({ code: 401, message: err.message });
        return;
      }
      // 防止修改密码后，原本的token还能用
      const userResult = await User.findOne({
        attributes: {
          exclude: ['password'],
        },
        where: {
          id: decode.userInfo.id,
        },
      });
      console.log(JSON.stringify(userResult), 252);

      if (userResult.token !== token) {
        console.log('登录信息过期!');
        resolve({ code: 401, message: '登录信息过期!' });
        return;
      }
      const userState = await getUserStatus(userResult.id);
      if (userState.code !== 200) {
        resolve(userState);
        return;
      }
      resolve({ code: 200, message: '验证token通过!' });
    });
  });
};

// 生成jwt
const signJwt = (value: { userInfo: any; exp: number }): string => {
  console.log('生成jwt');
  const res = jwt.sign(value, jwtSecret);
  console.log(res);
  return res;
};

export { authJwt, signJwt };
