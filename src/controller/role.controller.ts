import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import { IRole } from '@/interface';
import authService from '@/service/auth.service';
import roleService from '@/service/role.service';
import { arrUnique, arrayToTree } from '@/utils';

class RoleController {
  async getAllList(ctx: ParameterizedContext, next) {
    try {
      const result = await roleService.getAllList();
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

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

  // 获取树型角色
  async getTreeList(ctx: ParameterizedContext, next) {
    try {
      const { id = 0 } = ctx.request.query;
      const { rows } = await roleService.getAllList();
      const data = arrayToTree({
        originArr: rows,
        originPid: +id,
        originIdKey: 'id',
        originPidKey: 'p_id',
        resChildrenKey: 'children',
        // resIdKey: 'id',
        // resPidKey: 'pid',
      });
      successHandler({ ctx, data });
    } catch (error) {
      emitError({ ctx, code: 400, error });
      return;
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
      const user_id = +ctx.params.user_id;
      const result = await roleService.getMyRole(user_id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  // 获取某个角色的权限
  async getRoleAuth(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      const result = await roleService.getRoleAuth(id);
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
    // await getCRole(result);
    // allRole.forEach((v) => {
    //   // eslint-disable-next-line
    //   delete v.c_role;
    // });
    // result.c_role = allRole;
    return result;
  }

  getAllChildRole = async (ctx: ParameterizedContext, next) => {
    try {
      const id = +ctx.params.id;
      const isExist = await roleService.isExist([id]);
      if (!isExist) {
        throw new Error(`不存在id为${id}的角色!`);
      }
      const result = await this.commonGetAllChildRole(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  };

  // 修改某个角色的权限
  async updateRoleAuth(ctx: ParameterizedContext, next) {
    try {
      const { id, auth_ids } = ctx.request.body;
      const isExistRole = await roleService.isExist([id]);
      if (!isExistRole) {
        throw new Error(`不存在id为${id}的角色!`);
      }
      const isExistAuth =
        auth_ids.length === 0 ? true : await authService.isExist(auth_ids);
      if (!isExistAuth) {
        throw new Error(`${auth_ids}中存在不存在的权限!`);
      }
      const role: any = await roleService.find(id);
      role.setAuths(auth_ids);
      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
      return;
    }
    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      const { p_id, role_name, role_description, role_auths }: IRole =
        ctx.request.body;
      if (id === 1 && p_id !== 0) {
        throw new Error(`不能修改根角色的p_id哦!`);
      }
      if (id !== 1 && p_id === 0) {
        throw new Error(`不能给其他角色设置为根角色哦!`);
      }
      const uniqueAuths = arrUnique(role_auths);
      const isExistAuth =
        uniqueAuths.length === 0
          ? true
          : await authService.isExist(uniqueAuths);
      if (!isExistAuth) {
        throw new Error(`${role_auths}中存在不存在的权限!`);
      }
      const ids = [p_id, id].filter((v) => v !== 0);
      if (!ids.length) {
        throw new Error(`${[p_id, id]}中存在不存在的角色!`);
      }
      const isExistRole = p_id === 0 ? true : await roleService.isExist([id]);
      if (!isExistRole) {
        throw new Error(`不存在id为${id}的角色!`);
      }
      await roleService.update({
        id,
        p_id,
        role_name,
        role_description,
      });
      const role: any = await roleService.find(id);
      await role.setAuths(role_auths);
      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
      return;
    }
    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    try {
      const { p_id, role_name, role_description, role_auths }: IRole =
        ctx.request.body;
      if (p_id === 0) {
        throw new Error(`不能新增根角色哦!`);
      }
      const isExist = await roleService.isExist([p_id]);
      if (!isExist) {
        throw new Error(`不存在id为${p_id}的角色!`);
      }
      const role: any = await roleService.create({
        p_id,
        role_name,
        role_description,
      });
      await role.setAuths(role_auths);
      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      const role: any = await roleService.find(id);
      if (role.p_id === 0) {
        throw new Error(`不能删除根角色哦!`);
      }
      if (!role) {
        throw new Error(`不存在id为${id}的角色!`);
      }
      const auths = await role.getAuths();
      await role.removeAuths(auths);
      await roleService.delete(id);
      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new RoleController();
