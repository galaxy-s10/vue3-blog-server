import MD5 from 'crypto-js/md5';
import { ParameterizedContext } from 'koa';

import emailController from './emailUser.controller';
import redisController from './redis.controller';

import { authJwt, signJwt } from '@/app/auth/authJwt';
import { REDIS_PREFIX, THIRD_PLATFORM } from '@/app/constant';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import { IEmail, IList, IUser } from '@/interface';
import User from '@/model/user.model';
import emailUserService from '@/service/emailUser.service';
import qqUserService from '@/service/qqUser.service';
import thirdUserService from '@/service/thirdUser.service';
import userService from '@/service/user.service';
import { randomNumber, randomString } from '@/utils';

export interface IUserList extends IList {
  username: string;
  title: string;
  created_at: string;
  updated_at: string;
}
class UserController {
  register = async (ctx: ParameterizedContext, next) => {
    try {
      const { email, code }: IEmail = ctx.request.body;
      const reg =
        /^[A-Za-z0-9\u4E00-\u9FA5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
      if (!reg.test(email)) {
        emitError({ ctx, code: 400, message: '请输入正确的邮箱!' });
        return;
      }
      const emailIsExist = await emailUserService.isExist([email]);
      if (emailIsExist) {
        emitError({ ctx, code: 400, message: '该邮箱已被他人使用!' });
      } else {
        const key = {
          prefix: REDIS_PREFIX.emailRegister,
          key: email,
        };
        // 判断redis中的验证码是否正确
        const redisData = await redisController.getVal(key);
        console.log(redisData, 7777);
        if (redisData !== code || !redisData) {
          emitError({ ctx, code: 400, message: '验证码错误或已过期!' });
          return;
        }
        // 用户表创建用户
        const userData = await this.handleCreate({
          username: `用户${randomNumber(8)}`,
          password: randomString(8),
        });
        // 邮箱表创建邮箱
        const emailData: any = await emailUserService.create({ email });
        // 第三方用户表绑定用户和邮箱
        await thirdUserService.create({
          user_id: userData.id,
          third_user_id: emailData.id,
          third_platform: THIRD_PLATFORM.email,
        });
        await redisController.del(key);
        const token = signJwt({
          userInfo: userData,
          exp: 24,
        });
        await User.update({ token }, { where: { id: userData?.id } }); // 每次登录都更新token
        successHandler({ ctx, data: token, message: '注册成功!' });
      }
    } catch (error) {
      emitError({ ctx, code: 400, error });
      return;
    }
    await next();
  };

  handleCreate = async ({ username, password, title, avatar }: IUser) => {
    const result = await userService.create({
      username,
      password,
      title,
      avatar,
    });
    return result;
  };

  create = async (ctx: ParameterizedContext, next) => {
    try {
      const { username, password, title, avatar }: IUser = ctx.request.body;
      const isExistSameName = await userService.isSameName(username);
      if (isExistSameName) {
        emitError({
          ctx,
          code: 400,
          error: `已存在用户名为${username}的用户!`,
        });
        return;
      }
      const result = await this.handleCreate({
        username,
        password,
        title,
        avatar,
      });
      successHandler({ ctx, data: result });
      /**
       * 这个其实是最后一个中间件了，其实加不加调不调用next都没影响，但是为了防止后面要
       * 是扩展又加了一个中间件，这里不调用await next()的话，会导致下一个中间件出现404或其他问题，
       * 因此还是得在这调用一次await next()
       */
    } catch (error) {
      emitError({ ctx, code: 400, error });
      return;
    }
    await next();
  };

  login = async (ctx: ParameterizedContext, next) => {
    try {
      const { id, password, exp = 24 } = ctx.request.body;
      const userInfo: any = await User.findOne({
        attributes: { exclude: ['password', 'token'] },
        where: { id, password },
      });
      if (!userInfo) {
        emitError({
          ctx,
          code: 401,
          message: '账号或密码错误!',
        });
        return;
      }
      const token = signJwt({
        userInfo,
        exp,
      });
      await User.update({ token }, { where: { id: userInfo?.id } }); // 每次登录都更新token
      successHandler({ ctx, data: token, message: '登录成功!' });
    } catch (error) {
      emitError({
        ctx,
        code: 400,
        error,
      });
      return;
    }
    /**
     * 这个其实是最后一个中间件了，其实加不加调不调用next都没硬性，但是为了防止后面要
     * 是扩展又加了一个中间件，这里不调用await next()的话，会导致下一个中间件出现404或其他问题，
     * 因此还是得在这调用一次await next()
     */
    await next();
  };

  login1 = async (ctx: ParameterizedContext, next) => {
    try {
      const { email, password, exp = 24 } = ctx.request.body;
      console.log(email, password, 4444422);
      const findEmailUserRes: any = await emailUserService.findThirdUser(email);
      console.log(findEmailUserRes, 56);
      if (!findEmailUserRes) {
        emitError({
          ctx,
          code: 400,
          message: '该邮箱未注册!',
        });
        return;
      }
      console.log(findEmailUserRes, 232);
      console.log(findEmailUserRes.users[0]);
      const user = findEmailUserRes.users[0].get();
      const userInfo: any = await User.findOne({
        attributes: { exclude: ['password', 'token'] },
        where: { id: user.id, password },
      });
      if (!userInfo) {
        emitError({
          ctx,
          code: 401,
          message: '邮箱或密码错误!',
        });
        return;
      }
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
          exp,
        });
        await User.update({ token }, { where: { id: userInfo?.id } }); // 每次登录都更新token
        successHandler({ ctx, data: token, message: '登录成功!' });
      }
    } catch (error) {
      emitError({
        ctx,
        code: 400,
        error,
      });
      return;
    }
    /**
     * 这个其实是最后一个中间件了，其实加不加调不调用next都没硬性，但是为了防止后面要
     * 是扩展又加了一个中间件，这里不调用await next()的话，会导致下一个中间件出现404或其他问题，
     * 因此还是得在这调用一次await next()
     */
    await next();
  };

  codeLogin = async (ctx: ParameterizedContext, next) => {
    try {
      const { email, code, exp = 24 } = ctx.request.body;
      const key = {
        prefix: REDIS_PREFIX.emailLogin,
        key: email,
      };
      // 判断redis中的验证码是否正确
      const redisData = await redisController.getVal(key);
      console.log(redisData, 7777);
      if (redisData !== code || !redisData) {
        emitError({ ctx, code: 400, message: '验证码错误或已过期!' });
        return;
      }
      const findEmailUserRes = await emailUserService.findThirdUser(email);
      const user = findEmailUserRes.get().users[0].get();
      console.log(user);
      const userInfo: any = await User.findOne({
        attributes: { exclude: ['password', 'token'] },
        where: { id: user.id },
      });
      const token = signJwt({
        userInfo,
        exp,
      });
      await User.update({ token }, { where: { id: userInfo?.id } }); // 每次登录都更新token
      successHandler({ ctx, data: token, message: '登录成功!' });
    } catch (error) {
      emitError({
        ctx,
        code: 400,
        error,
      });
      return;
    }
    /**
     * 这个其实是最后一个中间件了，其实加不加调不调用next都没硬性，但是为了防止后面要
     * 是扩展又加了一个中间件，这里不调用await next()的话，会导致下一个中间件出现404或其他问题，
     * 因此还是得在这调用一次await next()
     */
    await next();
  };

  async list(ctx: ParameterizedContext, next) {
    try {
      // @ts-ignore
      const {
        username,
        title,
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'id',
        created_at,
        updated_at,
      }: IUserList = ctx.request.query;
      const result = await userService.getList({
        username,
        title,
        nowPage,
        pageSize,
        orderBy,
        orderName,
        created_at,
        updated_at,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async find(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      const result = await userService.find(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async getUserInfo(ctx: ParameterizedContext, next) {
    try {
      const { code, userInfo, message } = await authJwt(ctx.request);
      if (code === 200) {
        const result = await userService.getUserInfo(userInfo?.id);
        successHandler({ ctx, data: result });
        await next();
        return;
      }
      emitError({ ctx, code, error: message });
      return;
    } catch (error) {
      emitError({ ctx, code: 401, error, message: error.message });
    }
  }

  async update(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      const { username, password, title, status, avatar }: IUser =
        ctx.request.body;
      const isExist = await userService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的用户!` });
        return;
      }
      const isExistSameName = await userService.isSameName(username);
      if (isExistSameName && isExistSameName.id !== id) {
        emitError({
          ctx,
          code: 400,
          error: `已存在用户名为${username}的用户!`,
        });
        return;
      }
      const result = await userService.update({
        id,
        username,
        password,
        title,
        status,
        avatar,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      const isExist = await userService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的用户!` });
        return;
      }
      const result = await userService.delete(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }
}
export default new UserController();
