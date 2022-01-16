import { Context } from 'koa';

import MD5 from 'crypto-js/md5';
import { emitError } from '@/app/handler/emit-error';
import errorHandler from '@/app/handler/error-handle';
import successHandler from '@/app/handler/success-handle';
import userService from '@/service/user.service';
import { signJwt } from '@/app/authJwt';
import User from '@/model/user.model';

class UserController {
  async create(ctx: Context, next) {
    try {
      const prop = ctx.request.body;
      console.log('创建用户', prop);
      const result = await userService.create(prop);
      successHandler({ ctx, data: result });
      /**
       * 这个其实是最后一个中间件了，其实加不加调不调用next都没硬性，但是为了防止后面要
       * 是扩展又加了一个中间件，这里不调用await next()的话，会导致下一个中间件出现404或其他问题，
       * 因此还是得在这调用一次await next()
       */
      await next();
    } catch (error) {
      emitError({ ctx, code: 400, error });
      await next();
    }
  }

  async login(ctx: Context, next) {
    try {
      const { username, password, exp = 1 } = ctx.request.body;
      console.log(MD5(password), 32);
      const userInfo = await User.findOne({
        attributes: {
          exclude: ['password', 'token'],
        },
        where: {
          username,
          password: MD5(password).toString(),
        },
      });
      if (userInfo) {
        /**
         * https://github.com/auth0/node-jsonwebtoken#usage
         * exp: Math.floor(Date.now() / 1000) + (60 * 60),签名一个到期1小时的令牌
         * exp:1，1小时后过期
         * exp:2，2小时后过期
         * exp:3，3小时后过期
         */
        const token = signJwt({
          userInfo,
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * exp,
        });
        await User.update({ token }, { where: { id: userInfo.id } }); // 每次登录都更新token
        successHandler({ ctx, data: token });
      } else {
        successHandler({ ctx, data: userInfo, message: '账号或密码错误！' });
      }
      /**
       * 这个其实是最后一个中间件了，其实加不加调不调用next都没硬性，但是为了防止后面要
       * 是扩展又加了一个中间件，这里不调用await next()的话，会导致下一个中间件出现404或其他问题，
       * 因此还是得在这调用一次await next()
       */
      await next();
    } catch (error) {
      emitError({ ctx, code: 400, error });
      await next();
    }
  }

  async list(ctx: Context, next) {
    try {
      const prop = ctx.request.body;
      const result = await userService.getList(prop);
      successHandler({ ctx, data: result });
      await next();
    } catch (error) {
      errorHandler({ ctx, code: 400, error: error.message });
      await next();
    }
  }
}

export default new UserController();
