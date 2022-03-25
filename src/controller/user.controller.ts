import MD5 from 'crypto-js/md5';
import { ParameterizedContext } from 'koa';

import { authJwt, signJwt } from '@/app/authJwt';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import { IList, IUser } from '@/interface';
import User from '@/model/user.model';
import userService from '@/service/user.service';

export interface IUserList extends IList {
  username: string;
  title: string;
  created_at: string;
  updated_at: string;
}
class UserController {
  async create(ctx: ParameterizedContext, next) {
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
      const result = await userService.create({
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
  }

  login = async (ctx: ParameterizedContext, next) => {
    try {
      const { id, password, exp = 24 } = ctx.request.body;
      const userInfo: any = await User.findOne({
        attributes: { exclude: ['password', 'token'] },
        where: { id, password },
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
          exp,
        });
        await User.update({ token }, { where: { id: userInfo?.id } }); // 每次登录都更新token
        successHandler({ ctx, data: token });
      } else {
        successHandler({
          ctx,
          data: userInfo,
          message: '账号或密码错误!',
        });
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
      } else {
        emitError({ ctx, code, error: message });
      }
    } catch (error) {
      emitError({ ctx, code: 401, error, message: error.message });
    }
    await next();
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
