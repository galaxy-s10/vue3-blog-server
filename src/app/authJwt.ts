import jwt from 'jsonwebtoken';
import path from 'path';
import { jwtSecret } from '@/config/secret';
import getUserStatus from './getUserStatus';
import { IUser } from '@/interface';

const authJwt = (
  req
): Promise<{ code: number; message: string; userInfo?: IUser }> => {
  return new Promise((resolve) => {
    // 首先判断请求头有没有authorization
    if (req.headers.authorization === undefined) {
      resolve({ code: 401, message: '未登录!' });
      return;
    }
    const token = req.headers.authorization?.split(' ')[1];
    jwt.verify(token, jwtSecret, {}, async (err, decode) => {
      if (err) {
        // 判断非法/过期token
        resolve({ code: 401, message: err.message });
        return;
      }
      // eslint-disable-next-line
      const userModel = require(path.resolve(
        __dirname,
        `../model/user.model.ts`
      )).default;
      // 防止修改密码后，原本的token还能用
      const userResult = await userModel.findOne({
        attributes: {
          exclude: ['password'],
        },
        where: {
          id: decode.userInfo.id,
        },
      });

      if (userResult.token !== token) {
        console.log('登录信息过期!');
        resolve({ code: 401, message: '登录信息过期!' });
        return;
      }
      const userStatus = await getUserStatus(userResult.id);
      if (userStatus.code !== 200) {
        resolve(userStatus);
        return;
      }
      resolve({ code: 200, message: '验证token通过!', userInfo: userResult });
    });
  });
};

// 生成jwt
const signJwt = (value: { userInfo: any; exp: number }): string => {
  const res = jwt.sign(
    { ...value, exp: Math.floor(Date.now() / 1000) + 60 * 60 * value.exp },
    jwtSecret
  );
  return res;
};

export { authJwt, signJwt };
