import jwt from 'jsonwebtoken';

import getUserStatus from './getUserStatus';

import { jwtSecret } from '@/config/secret';
import { IUser } from '@/interface';
import userModel from '@/model/user.model';

const authJwt = (
  req
): Promise<{ code: number; message: string; userInfo?: IUser }> => {
  return new Promise((resolve, reject) => {
    // 首先判断请求头有没有authorization
    if (req.headers.authorization === undefined) {
      resolve({ code: 401, message: '未登录!' });
      return;
    }
    const token = req.headers.authorization?.split(' ')[1];
    jwt.verify(token, jwtSecret, {}, async (err, decode: jwt.JwtPayload) => {
      if (err) {
        // 判断非法/过期token
        // eslint-disable-next-line prefer-promise-reject-errors
        reject({ code: 401, message: '登录信息过期!' });
        return;
      }

      // 防止修改密码后，原本的token还能用
      const userResult: any = await userModel.findOne({
        attributes: {
          exclude: ['password'],
        },
        where: {
          id: decode.userInfo.id,
        },
      });
      if (!userResult) {
        // 防止token是正确的，但是这个用户已经被删除了。
        // eslint-disable-next-line prefer-promise-reject-errors
        reject({ code: 401, message: '该用户不存在!' });
        return;
      }
      if (userResult.token !== token) {
        // 单点登录
        // eslint-disable-next-line prefer-promise-reject-errors
        reject({ code: 401, message: '登录信息过期!' });
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
