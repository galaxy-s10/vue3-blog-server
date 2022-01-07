import { secret } from '../config/secret';
import User from '../model/user.model';
import getUserStatus from './getUserStatus';

const jwt = require('jsonwebtoken');

const authJwt = (req): Promise<{ code: number; message: string }> => {
  return new Promise((resolve, reject) => {
    // 首先判断请求头有没有authorization
    if (req.headers.authorization === undefined) {
      resolve({ code: 401, message: '未登录!' });
      return;
    }
    const token = req.headers.authorization?.split(' ')[1];

    jwt.verify(token, secret, async (err, decode) => {
      if (err) {
        // 判断非法/过期token
        resolve({ code: 401, message: err.message });
        return;
      }
      // 防止修改密码后，原本的token还能用
      const userResult = await User.findOne({
        attributes: ['token'],
        where: {
          id: decode.userInfo.id,
        },
      });
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

export default authJwt;
