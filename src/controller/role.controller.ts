import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import { PROJECT_ENV } from '@/constant';
import { IList, IRole } from '@/interface';
import authService from '@/service/auth.service';
import roleService from '@/service/role.service';
import { arrayUnique, arrayToTree, arrayGetDifference } from '@/utils';

class RoleController {
  async getAllList(ctx: ParameterizedContext, next) {
    try {
      const {
        orderBy = 'asc',
        orderName = 'id',
        id,
        type,
        keyWord,
      }: IList<IRole> = ctx.request.query;
      const result = await roleService.getAllList({
        orderBy,
        orderName,
        id,
        type,
        keyWord,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async getList(ctx: ParameterizedContext, next) {
    try {
      const {
        id,
        orderBy = 'asc',
        orderName = 'id',
        nowPage,
        pageSize,
        keyWord,
        type,
      }: IList<IRole> = ctx.request.query;
      const result = await roleService.getList({
        nowPage,
        pageSize,
        orderBy,
        orderName,
        id,
        type,
        keyWord,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  // 获取所有角色（树型）
  async getTreeRole(ctx: ParameterizedContext, next) {
    try {
      const {
        id = 0,
        orderBy = 'asc',
        orderName = 'id',
      }: IList<IRole> = ctx.request.query;
      if (Number.isNaN(+id)) {
        emitError({ ctx, code: 400, message: `${id}，id格式不对` });
        return;
      }
      const { rows } = await roleService.getAllList({ orderBy, orderName });
      const result = arrayToTree({
        originArr: rows,
        originPid: +id,
        originIdKey: 'id',
        originPidKey: 'p_id',
        resChildrenKey: 'children',
        // resIdKey: 'id',
        // resPidKey: 'pid',
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
      return;
    }
    await next();
  }

  // 获取除了父级以外的所有角色（树型）
  async getTreeChildRole(ctx: ParameterizedContext, next) {
    try {
      // id是指根节点的id，不是根节点的p_id(因为根节点的p_id是null，其他节点的p_id是也可能是null)
      const { rows } = await roleService.getPidNotNullRole();
      const result = arrayToTree({
        originArr: rows,
        // @ts-ignore
        originPid: 1,
        originIdKey: 'id',
        originPidKey: 'p_id',
        resChildrenKey: 'children',
        // resIdKey: 'id',
        // resPidKey: 'pid',
      });
      successHandler({ ctx, data: result });
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

  // 获取某个用户的角色
  async getUserRole(ctx: ParameterizedContext, next) {
    try {
      const user_id = +ctx.params.user_id;
      const result = await roleService.getMyRole(user_id);
      successHandler({ ctx, data: { total: result.length, result } });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  // 获取某个角色的权限
  async getRoleAuth(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      const isExist = await roleService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, message: `不存在id为${id}的角色！` });
        return;
      }
      const result = await roleService.getRoleAuth(id);
      successHandler({ ctx, data: { total: result.length, result } });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  // 获取某个角色的权限（递归找所有）
  async getAllRoleAuth(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      const result = await roleService.getRoleAuth(id);
      successHandler({ ctx, data: { total: result.length, result } });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  // 获取我的角色
  getMyRole = async (ctx: ParameterizedContext, next) => {
    try {
      const { code, userInfo, message } = await authJwt(ctx);
      if (code !== 200) {
        emitError({ ctx, code, error: message });
        return;
      }
      const result = await roleService.getMyRole(userInfo.id);
      successHandler({ ctx, data: { total: result.length, result } });
    } catch (error) {
      emitError({ ctx, code: 400, error });
      return;
    }
    await next();
  };

  // 获取我的角色（递归找所有）
  getMyAllRole = async (ctx: ParameterizedContext, next) => {
    try {
      const { code, userInfo, message } = await authJwt(ctx);
      if (code !== 200) {
        emitError({ ctx, code, error: message });
        return;
      }
      const result = await roleService.getMyRole(userInfo.id);
      const role = [];
      result.forEach((v) => {
        role.push(this.commonGetAllChildRole(v.id));
      });
      // 这是个二维数组
      const roleRes = await Promise.all(role);
      // 将二维数组拍平
      // const roleResFlat = roleRes.reduce((a, b) => a.concat(b), []);
      const roleResFlat = roleRes.flat();
      successHandler({ ctx, data: [...result, ...roleResFlat] });
    } catch (error) {
      emitError({ ctx, code: 400, error });
      return;
    }
    await next();
  };

  async commonGetAllChildRole(id) {
    const allRole = [];
    const queue = [];
    const result = [id];
    const tmp = [];
    // eslint-disable-next-line no-shadow
    const getChildRole = async (id: number): Promise<any[]> => {
      const c: any = await roleService.findAllChildren(id);
      tmp.push(id);
      if (c.length > 0) allRole.push(...c);
      for (let i = 0; i < c.length; i += 1) {
        const item = c[i];
        queue.push(getChildRole(item.id));
      }
      return c;
    };
    const one = await getChildRole(id);
    one.forEach((v) => {
      result.push(v.id);
    });
    const res = await Promise.all(queue);
    res.forEach((v) => {
      v[0] && result.push(v[0].id);
    });
    console.log(result, tmp, arrayGetDifference(result, tmp));
    const diff = arrayGetDifference(result, tmp);
    const diffQueqe = [];
    if (diff.length) {
      for (let i = 0; i < diff.length; i += 1) {
        const v = [diff][i];
        // const x = await this.commonGetAllChildRole(v);
        // allRole.push(x);
        diffQueqe.push(this.commonGetAllChildRole(v));
      }
    }
    await Promise.all(diffQueqe);
    // console.log(diffQueqeRes, '222');
    return allRole;
  }

  // 获取该角色的子角色（递归查找所有）
  getAllChildRole = async (ctx: ParameterizedContext, next) => {
    try {
      const id = +ctx.params.id;
      const isExist = await roleService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, message: `不存在id为${id}的角色！` });
        return;
      }
      const result = await this.commonGetAllChildRole(id);
      console.log(result.length, 333333);
      successHandler({ ctx, data: { total: result.length, result } });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  };

  /** 获取该角色的子角色（只找一层） */
  getChildRole = async (ctx: ParameterizedContext, next) => {
    try {
      const id = +ctx.params.id;
      const isExist = await roleService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的角色！` });
        return;
      }
      const result = await roleService.findByPid(id);
      successHandler({ ctx, data: { total: result.length, result } });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  };

  // 修改某个角色的权限
  async updateRoleAuth(ctx: ParameterizedContext, next) {
    try {
      const { id, auth_ids } = ctx.request.body as {
        id: number;
        auth_ids: number[];
      };
      if (PROJECT_ENV === 'beta') {
        const role: any = await roleService.find(id);
        if (role.type === 1) {
          emitError({ ctx, code: 403, message: '测试环境不能操作默认角色' });
          return;
        }
      }
      const hasAuth = await verifyUserAuth(ctx);
      if (!hasAuth) {
        emitError({ ctx, code: 403, message: '权限不足！' });
        return;
      }
      const isExistRole = await roleService.isExist([id]);
      if (!isExistRole) {
        emitError({ ctx, code: 400, message: `不存在id为${id}的角色！` });
        return;
      }
      const isExistAuth =
        auth_ids.length === 0 ? true : await authService.isExist(auth_ids);
      if (!isExistAuth) {
        emitError({
          ctx,
          code: 400,
          message: `${auth_ids.toString()}中存在不存在的权限！`,
        });
        return;
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
      if (PROJECT_ENV === 'beta') {
        const role: any = await roleService.find(id);
        if (role.type === 1) {
          emitError({ ctx, code: 403, message: '测试环境不能操作默认角色' });
          return;
        }
      }
      const hasAuth = await verifyUserAuth(ctx);
      if (!hasAuth) {
        emitError({ ctx, code: 403, message: '权限不足！' });
        return;
      }
      const { p_id, role_name, role_value, type, priority }: IRole =
        ctx.request.body;
      if (id === 1 && p_id !== 0) {
        emitError({ ctx, code: 400, error: '不能修改根角色的p_id哦！' });
        return;
      }
      if (id === p_id) {
        emitError({ ctx, code: 400, error: '父角色不能等于子角色！' });
        return;
      }
      if (id === 1) {
        await roleService.update({
          id,
          p_id,
          role_name,
          role_value,
          type,
          priority,
        });
      } else {
        const isExist = await roleService.isExist([id, p_id]);
        if (!isExist) {
          emitError({
            ctx,
            code: 400,
            message: `${[id, p_id].toString()}中存在不存在的角色！`,
          });
          return;
        }
        const c_role: any = await roleService.find(p_id);
        if (id !== 1 && c_role.p_id === id) {
          emitError({
            ctx,
            code: 400,
            message: `不能将自己的子角色作为父角色！`,
          });
          return;
        }
        await roleService.update({
          id,
          p_id,
          role_name,
          role_value,
          type,
          priority,
        });
      }

      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
      return;
    }
    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    try {
      const {
        p_id,
        role_name,
        role_value,
        type = 2,
        priority = 1,
      }: IRole = ctx.request.body;
      const hasAuth = await verifyUserAuth(ctx);
      if (!hasAuth) {
        emitError({ ctx, code: 403, message: '权限不足！' });
        return;
      }
      const isExist = p_id === 0 ? false : await roleService.isExist([p_id]);
      if (!isExist) {
        emitError({ ctx, code: 400, message: `不存在id为${p_id}的角色！` });
        return;
      }
      await roleService.create({
        p_id,
        role_name,
        role_value,
        type,
        priority,
      });
      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  // 批量删除子角色
  batchDeleteChildRoles = async (ctx: ParameterizedContext, next) => {
    try {
      const { id, c_roles }: IRole = ctx.request.body;
      if (PROJECT_ENV === 'beta') {
        const role: any = await roleService.find(id);
        if (role.type === 1) {
          emitError({ ctx, code: 403, message: '测试环境不能操作默认角色' });
          return;
        }
      }
      const hasAuth = await verifyUserAuth(ctx);
      if (!hasAuth) {
        emitError({ ctx, code: 403, message: '权限不足！' });
        return;
      }
      if (id === undefined) {
        console.log('>>>', id);
        emitError({ ctx, code: 400, message: `请传入id！` });
        return;
      }
      if (!c_roles || !c_roles.length) {
        emitError({ ctx, code: 400, message: `请传入要删除的子角色！` });
        return;
      }
      const isExist = await roleService.isExist([id, ...c_roles]);
      if (!isExist) {
        emitError({
          ctx,
          code: 400,
          message: `${[id, ...c_roles].toString()}中存在不存在的角色！`,
        });
        return;
      }
      const all_child_roles: any = await roleService.findByPid(id);
      const all_child_roles_id = all_child_roles.map((v) => v.id);
      const hasDiff = arrayGetDifference(c_roles, all_child_roles_id);
      if (hasDiff.length) {
        emitError({
          ctx,
          code: 400,
          message: `${c_roles.toString()}中的角色父级id不是${id}！`,
        });
        return;
      }
      const queue = [];
      c_roles.forEach((v) => {
        queue.push(this.commonGetAllChildRole(v));
      });
      // 这是个二维数组
      const roleRes = await Promise.all(queue);
      // 将二维数组拍平
      const roleResFlat = roleRes.flat();
      await roleService.delete([...roleResFlat.map((v) => v.id), ...c_roles]);
      successHandler({
        ctx,
        message: `删除成功，删除了${c_roles.length}个子角色和${roleResFlat.length}个关联角色`,
      });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  };

  // 批量新增子角色
  batchAddChildRoles = async (ctx: ParameterizedContext, next) => {
    try {
      const { id, c_roles }: IRole = ctx.request.body;
      if (PROJECT_ENV === 'beta') {
        const role: any = await roleService.find(id);
        if (role.type === 1) {
          emitError({ ctx, code: 403, message: '测试环境不能操作默认角色！' });
          return;
        }
      }
      const hasAuth = await verifyUserAuth(ctx);
      if (!hasAuth) {
        emitError({ ctx, code: 403, message: '权限不足！' });
        return;
      }
      if (id === undefined) {
        emitError({ ctx, code: 400, message: `请传入id！` });
        return;
      }
      if (!c_roles || !c_roles.length) {
        emitError({ ctx, code: 400, message: `请传入要新增的子角色！` });
        return;
      }
      if (c_roles.includes(id)) {
        emitError({ ctx, code: 400, message: `父级角色不能在子角色里面！` });
        return;
      }
      const isExist = await roleService.isExist([id, ...c_roles]);
      if (!isExist) {
        emitError({
          ctx,
          code: 400,
          message: `${[id, ...c_roles].toString()}中存在不存在的角色！`,
        });
        return;
      }
      const result1: any = await roleService.findAllByInId(c_roles);
      const result2: number[] = result1.map((v) => v.p_id);
      const isUnique = arrayUnique(result2).length === 1;
      if (!isUnique) {
        emitError({
          ctx,
          code: 400,
          message: `${c_roles.toString()}不是同一个父级角色！`,
        });
        return;
      }
      await roleService.updateMany(c_roles, id);
      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  };

  delete = async (ctx: ParameterizedContext, next) => {
    try {
      const id = +ctx.params.id;
      if (PROJECT_ENV === 'beta') {
        const role: any = await roleService.find(id);
        if (role.type === 1) {
          emitError({ ctx, code: 403, message: '测试环境不能操作默认角色' });
          return;
        }
      }
      const hasAuth = await verifyUserAuth(ctx);
      if (!hasAuth) {
        emitError({ ctx, code: 403, message: '权限不足！' });
        return;
      }
      if (id === 1) {
        emitError({ ctx, code: 400, message: `不能删除根角色哦！` });
        return;
      }
      const role: any = await roleService.find(id);
      if (!role) {
        emitError({ ctx, code: 400, message: `不存在id为${id}的角色！` });
        return;
      }
      const auths = await role.getAuths();
      await role.removeAuths(auths); // 删除该角色的权限
      const result = await this.commonGetAllChildRole(id);
      await roleService.delete([id, ...result.map((v) => v.id)]);
      successHandler({
        ctx,
        message: `删除成功，且删除了${result.length}个关联角色`,
      });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  };
}

export default new RoleController();
