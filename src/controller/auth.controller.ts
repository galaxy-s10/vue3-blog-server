import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import { IAuth } from '@/interface';
import authService from '@/service/auth.service';

class AuthController {
  async getList(ctx: ParameterizedContext, next) {
    try {
      const {
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'id',
      } = ctx.request.query;
      const result = await authService.getList({
        nowPage,
        pageSize,
        orderBy,
        orderName,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async getUserAuth(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      const result: any = await authService.getMyAuth(id);
      const auths = [];
      const res = result.get();
      res.roles.forEach((item) => {
        auths.push(...item.auths);
      });
      res.auths = auths;
      delete res.roles;

      successHandler({ ctx, data: res });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async getMyAuth(ctx: ParameterizedContext, next) {
    try {
      const { userInfo } = await authJwt(ctx);
      const result: any = await authService.getMyAuth(userInfo.id);
      const auths = [];
      const res = result.get();
      res.roles.forEach((item) => {
        auths.push(...item.auths);
      });
      res.auths = auths;
      delete res.roles;

      successHandler({ ctx, data: res });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async find(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      const result = await authService.find(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      const { p_id, auth_name, auth_description }: IAuth = ctx.request.body;
      const isExist = p_id === 0 ? true : await authService.isExist([p_id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${p_id}的权限!` });
        return;
      }
      await authService.update({
        id,
        p_id,
        auth_name,
        auth_description,
      });
      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    try {
      const { p_id, auth_name, auth_description }: IAuth = ctx.request.body;
      const isExist = p_id === 0 ? true : await authService.isExist([p_id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${p_id}的权限!` });
        return;
      }
      const result = await authService.create({
        p_id,
        auth_name,
        auth_description,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  /** 获取该权限的所有子权限 */
  async commonGetAllChildAuth(id) {
    const result: any = await authService.findAllChildren(id);
    let queue = [];
    const allAuth = [];
    const getCAuth = async (auth) => {
      if (auth.c_auth.length > 0) {
        auth.c_auth.forEach((item) => {
          queue.push(authService.findAllChildren(item.id));
        });
      }
      const c = await Promise.all(queue);
      allAuth.push(...c);
      queue = [];
      for (let i = 0; i < c.length; i += 1) {
        const item = c[i];
        if (item.c_auth.length > 0) {
          queue.push(getCAuth(item));
        }
      }
      await Promise.all(queue);
    };
    await getCAuth(result);
    allAuth.forEach((v) => {
      // eslint-disable-next-line
      delete v.c_auth;
    });
    result.c_auth = allAuth;
    return result;
  }

  /** 获取该权限的所有子权限 */
  getAllChildAuth = async (ctx: ParameterizedContext, next) => {
    try {
      const id = +ctx.params.id;
      const isExist = await authService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的权限!` });
        return;
      }
      const result = await this.commonGetAllChildAuth(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  };

  delete = async (ctx: ParameterizedContext, next) => {
    try {
      const id = +ctx.params.id;
      const isExist = await authService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的权限!` });
        return;
      }
      const auth = await this.commonGetAllChildAuth(id);
      const c_auth_ids = auth.c_auth.map((item) => item.id);
      await authService.delete([...c_auth_ids, id]);
      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  };
}

export default new AuthController();
