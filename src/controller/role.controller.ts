import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import { IRole } from '@/interface';
import roleService from '@/service/role.service';
import { arrUnique } from '@/utils';

class RoleController {
  async getList(ctx: ParameterizedContext, next) {
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
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async find(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      const result = await roleService.find(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async getUserRole(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      const result = await roleService.getMyRole(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async getMyRole(ctx: ParameterizedContext, next) {
    try {
      const { userInfo } = await authJwt(ctx);
      const result = await roleService.getMyRole(userInfo.id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  /** 获取该角色的所有子角色 */
  async commonGetAllChildRole(id) {
    const result: any = await roleService.findAllChildren(id);
    let queue = [];
    const allRole = [];
    const getCRole = async (role) => {
      if (role.c_role.length > 0) {
        role.c_role.forEach((item) => {
          queue.push(roleService.findAllChildren(item.id));
        });
      }
      const c = await Promise.all(queue);
      allRole.push(...c);
      queue = [];
      for (let i = 0; i < c.length; i += 1) {
        const item = c[i];
        if (item.c_role.length > 0) {
          queue.push(getCRole(item));
        }
      }
      await Promise.all(queue);
    };
    await getCRole(result);
    allRole.forEach((v) => {
      // eslint-disable-next-line
      delete v.c_role;
    });
    result.c_role = allRole;
    return result;
  }

  getAllChildRole = async (ctx: ParameterizedContext, next) => {
    try {
      const id = +ctx.params.id;
      const isExist = await roleService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的角色!` });
        return;
      }
      const result = await this.commonGetAllChildRole(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  };

  async update(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      const { p_id, role_name, role_description }: IRole = ctx.request.body;
      const ids = p_id === 0 ? [id] : [id, p_id];
      const isExist = await roleService.isExist(ids);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${ids}的角色!` });
        return;
      }
      await roleService.update({
        id,
        p_id,
        role_name,
        role_description,
      });
      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
      return;
    }
    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    try {
      const { p_id, role_name, role_description }: IRole = ctx.request.body;
      const isExist = p_id === 0 ? true : await roleService.isExist([p_id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${p_id}的角色!` });
        return;
      }
      await roleService.create({
        p_id,
        role_name,
        role_description,
      });
      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      const isExist = await roleService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的角色!` });
        return;
      }
      await roleService.delete(id);
      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new RoleController();
