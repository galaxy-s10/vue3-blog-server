import { Context } from 'koa';

import errorHandler from '@/app/handler/error-handle';
import successHandler from '@/app/handler/success-handle';
import { IAuth } from '@/interface';
import authService from '@/service/auth.service';

class AuthController {
  async getList(ctx: Context, next) {
    try {
      const {
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'id',
      } = ctx.request.query;
      const { rows, count } = await authService.getList({
        nowPage,
        pageSize,
        orderBy,
        orderName,
      });
      successHandler({ ctx, data: { rows, count } });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }

  async getNestList(ctx: Context, next) {
    try {
      const { rows, count } = await authService.getNestList();
      successHandler({ ctx, data: { rows, count } });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }

  async getUserAuth(ctx: Context, next) {
    try {
      const id = +ctx.params.userid;
      const { rows, count } = await authService.getUserAuth(id);
      successHandler({ ctx, data: { rows, count } });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }

  async find(ctx: Context, next) {
    try {
      const id = +ctx.params.id;
      const result = await authService.find(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }

  async update(ctx: Context, next) {
    try {
      const id = +ctx.params.id;
      const { p_id, auth_name, auth_description }: IAuth = ctx.request.body;
      const isExist = p_id === 0 ? true : await authService.isExist([p_id]);
      if (!isExist) {
        errorHandler({ ctx, code: 400, error: `不存在id为${p_id}的权限!` });
        return;
      }
      const result = await authService.update({
        id,
        p_id,
        auth_name,
        auth_description,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }

  async create(ctx: Context, next) {
    try {
      const { p_id, auth_name, auth_description }: IAuth = ctx.request.body;
      const isExist = p_id === 0 ? true : await authService.isExist([p_id]);
      if (!isExist) {
        errorHandler({ ctx, code: 400, error: `不存在id为${p_id}的权限!` });
        return;
      }
      const result = await authService.create({
        p_id,
        auth_name,
        auth_description,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }

  async delete(ctx: Context, next) {
    try {
      const id = +ctx.params.id;
      const isExist = await authService.isExist([id]);
      if (!isExist) {
        errorHandler({ ctx, code: 400, error: `不存在id为${id}的权限!` });
        return;
      }
      const result = await authService.delete(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new AuthController();
