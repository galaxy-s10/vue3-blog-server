import { Context } from 'koa';

import errorHandler from '@/app/handler/error-handle';
import successHandler from '@/app/handler/success-handle';
import { IRole } from '@/interface';
import roleService from '@/service/role.service';

class RoleController {
  async getList(ctx: Context, next) {
    try {
      const {
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'id',
      } = ctx.request.query;
      const result = await roleService.getList({
        nowPage,
        pageSize,
        orderBy,
        orderName,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }

  async find(ctx: Context, next) {
    try {
      const id = +ctx.params.id;
      const result = await roleService.find(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }

  async update(ctx: Context, next) {
    try {
      const id = +ctx.params.id;
      const { p_id, role_name, role_description }: IRole = ctx.request.body;
      const isExist = p_id === 0 ? true : await roleService.isExist([p_id]);
      if (!isExist) {
        errorHandler({ ctx, code: 400, error: `不存在id为${p_id}的角色!` });
        return;
      }
      const result = await roleService.update({
        id,
        p_id,
        role_name,
        role_description,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }

  async create(ctx: Context, next) {
    try {
      const { p_id, role_name, role_description }: IRole = ctx.request.body;
      const isExist = p_id === 0 ? true : await roleService.isExist([p_id]);
      if (!isExist) {
        errorHandler({ ctx, code: 400, error: `不存在id为${p_id}的角色!` });
        return;
      }
      const result = await roleService.create({
        p_id,
        role_name,
        role_description,
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
      const isExist = await roleService.isExist([id]);
      if (!isExist) {
        errorHandler({ ctx, code: 400, error: `不存在id为${id}的角色!` });
        return;
      }
      const result = await roleService.delete(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new RoleController();
