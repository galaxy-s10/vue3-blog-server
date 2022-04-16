import { ParameterizedContext } from 'koa';

import redisController from './redis.controller';

import { authJwt, signJwt } from '@/app/auth/authJwt';
import { REDIS_PREFIX, THIRD_PLATFORM } from '@/app/constant';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import { IEmail, IList, IUser } from '@/interface';
import User from '@/model/user.model';
import emailUserService from '@/service/emailUser.service';
import roleService from '@/service/role.service';
import thirdUserService from '@/service/thirdUser.service';
import userService from '@/service/user.service';
import { arrayUnique, randomNumber, randomString } from '@/utils';

export interface IUserList extends IList {
  username: string;
  desc: string;
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
        throw new Error(`请输入正确的邮箱!`);
      }
      const emailIsExist = await emailUserService.isExist([email]);
      if (emailIsExist) {
        throw new Error(`该邮箱已被他人使用!`);
      } else {
        const key = {
          prefix: REDIS_PREFIX.emailRegister,
          key: email,
        };
        // 判断redis中的验证码是否正确
        const redisData = await redisController.getVal(key);
        if (redisData !== code || !redisData) {
          throw new Error(`验证码错误或已过期!`);
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

  handleCreate = async ({ username, password, desc, avatar }: IUser) => {
    const result = await userService.create({
      username,
      password,
      desc,
      avatar,
    });
    return result;
  };

  create = async (ctx: ParameterizedContext, next) => {
    try {
      const { username, password, desc, avatar }: IUser = ctx.request.body;
      const isExistSameName = await userService.isSameName(username);
      if (isExistSameName) {
        throw new Error(`已存在用户名为${username}的用户!`);
      }
      const result = await this.handleCreate({
        username,
        password,
        desc,
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
        throw new Error(`账号或密码错误!`);
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

  async list(ctx: ParameterizedContext, next) {
    try {
      // @ts-ignore
      const {
        username,
        desc,
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'id',
        created_at,
        updated_at,
      }: IUserList = ctx.request.query;
      const result = await userService.getList({
        username,
        desc,
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
      const { code, userInfo, message } = await authJwt(ctx);
      if (code === 200) {
        const result = await userService.getUserInfo(userInfo?.id);
        successHandler({ ctx, data: result });
        await next();
        return;
      }
      throw new Error(message);
    } catch (error) {
      emitError({ ctx, code: 401, error, message: error.message });
    }
  }

  async update(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      const { username, desc, status, avatar }: IUser = ctx.request.body;
      const isExist = await userService.isExist([id]);
      if (!isExist) {
        throw new Error(`不存在id为${id}的用户!`);
      }
      const isExistSameName: any = await userService.isSameName(username);
      if (isExistSameName && isExistSameName.id !== id) {
        throw new Error(`已存在用户名为${username}的用户!`);
      }
      await userService.update({
        id,
        username,
        desc,
        status,
        avatar,
      });
      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async updateUserRole(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      const { user_roles }: IUser = ctx.request.body;
      const isExistUser = await userService.isExist([id]);
      if (!isExistUser) {
        throw new Error(`不存在id为${id}的用户!`);
      }
      const ids = arrayUnique(user_roles);
      const isExistRole = await roleService.isExist(ids);
      if (!isExistRole) {
        throw new Error(`${ids}中存在不存在的角色!`);
      }
      const result = await roleService.updateUserRole({
        user_id: id,
        role_ids: user_roles,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }

    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    successHandler({ ctx, message: '敬请期待' });
    next();
  }
}
export default new UserController();
