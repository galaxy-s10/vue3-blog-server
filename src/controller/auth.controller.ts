import { ParameterizedContext } from 'koa';

import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import { PROJECT_ENV } from '@/constant';
import { IAuth } from '@/interface';
import authService from '@/service/auth.service';
import { arrayGetDifference, arrayToTree, arrayUnique } from '@/utils';

class AuthController {
  async commonGetAllChildAuth(id) {
    const allAuth = [];
    const queue = [];
    // eslint-disable-next-line no-shadow
    const getChildAuth = async (id: number) => {
      const c: any = await authService.findAllChildren(id);
      if (c.length > 0) allAuth.push(...c);
      for (let i = 0; i < c.length; i += 1) {
        const item = c[i];
        queue.push(getChildAuth(item.id));
      }
    };
    await getChildAuth(id);
    await Promise.all(queue);
    return allAuth;
  }

  // 权限列表（分页）
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

  // 权限列表（不分页）
  async getAllList(ctx: ParameterizedContext, next) {
    try {
      const result = await authService.getAllList();
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  // 获取所有权限（树型）
  async getTreeAuth(ctx: ParameterizedContext, next) {
    try {
      const { id = '0' } = ctx.request.query;
      if (Number.isNaN(+id)) {
        throw new Error('id格式不对');
      }
      const { rows } = await authService.getAllList();
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

  // 获取除了父级以外的所有权限（树型）
  async getTreeChildAuth(ctx: ParameterizedContext, next) {
    try {
      // id是指根节点的id，不是根节点的p_id(因为根节点的p_id是null，其他节点的p_id是也可能是null)
      const { rows } = await authService.getPidNotNullAuth();
      const result = arrayToTree({
        originArr: rows,
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

  // 查找权限
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

  // 获取该权限的子权限（只找一层）
  getChildAuth = async (ctx: ParameterizedContext, next) => {
    try {
      const id = +ctx.params.id;
      const isExist = await authService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的权限!` });
        return;
      }
      const result = await authService.findByPid(id);
      successHandler({ ctx, data: { total: result.length, result } });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  };

  // 获取该权限的子权限（递归查找所有）
  getAllChildAuth = async (ctx: ParameterizedContext, next) => {
    try {
      const id = +ctx.params.id;
      const isExist = await authService.isExist([id]);
      if (!isExist) {
        throw new Error(`不存在id为${id}的权限!`);
      }
      const result = await this.commonGetAllChildAuth(id);
      successHandler({ ctx, data: { total: result.length, result } });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  };

  // 创建权限
  async create(ctx: ParameterizedContext, next) {
    try {
      const hasAuth = await verifyUserAuth(ctx);
      if (!hasAuth) {
        emitError({ ctx, code: 403, error: '权限不足！' });
        return;
      }
      const {
        p_id,
        auth_name,
        auth_value,
        type = 2,
        priority = 1,
      }: IAuth = ctx.request.body;
      const isExist = p_id === 0 ? false : await authService.isExist([p_id]);
      if (!isExist) {
        throw new Error(`不存在id为${p_id}的权限!`);
      }
      await authService.create({
        p_id,
        auth_name,
        auth_value,
        type,
        priority,
      });
      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  // 更新权限
  async update(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      if (PROJECT_ENV === 'beta') {
        const role: any = await authService.find(id);
        if (role.type === 1) {
          emitError({ ctx, code: 403, message: '测试环境不能操作默认权限!' });
          return;
        }
      }
      const hasAuth = await verifyUserAuth(ctx);
      if (!hasAuth) {
        emitError({ ctx, code: 403, error: '权限不足！' });
        return;
      }
      const { p_id, auth_name, auth_value, type, priority }: IAuth =
        ctx.request.body;
      if (id === 1 && p_id !== 0) {
        throw new Error(`不能修改根权限的p_id哦!`);
      }
      if (id === p_id) {
        throw new Error(`父权限不能等于子权限!`);
      }
      if (id === 1) {
        await authService.update({
          id,
          p_id,
          auth_name,
          auth_value,
          type,
          priority,
        });
      } else {
        const isExist = await authService.isExist([id, p_id]);
        if (!isExist) {
          throw new Error(`${[id, p_id].toString()}中存在不存在的权限!`);
        }
        const c_auth: any = await authService.find(p_id);
        if (id !== 1 && c_auth.p_id === id) {
          throw new Error(`不能将自己的子权限作为父权限!`);
        }
        await authService.update({
          id,
          p_id,
          auth_name,
          auth_value,
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

  // 删除权限
  delete = async (ctx: ParameterizedContext, next) => {
    try {
      const id = +ctx.params.id;
      if (PROJECT_ENV === 'beta') {
        const role: any = await authService.find(id);
        if (role.type === 1) {
          emitError({ ctx, code: 403, message: '测试环境不能操作默认权限!' });
          return;
        }
      }
      const hasAuth = await verifyUserAuth(ctx);
      if (!hasAuth) {
        emitError({ ctx, code: 403, error: '权限不足！' });
        return;
      }
      if (id === 1) {
        throw new Error(`不能删除根权限哦!`);
      }
      const auth: any = await authService.find(id);
      if (!auth) {
        throw new Error(`不存在id为${id}的权限!`);
      }
      const result = await this.commonGetAllChildAuth(id);
      await authService.delete([id, ...result.map((v) => v.id)]);
      successHandler({
        ctx,
        message: `删除成功，且删除了${result.length}个关联权限`,
      });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  };

  // 批量新增子权限
  batchAddChildAuths = async (ctx: ParameterizedContext, next) => {
    try {
      const { id, c_auths }: IAuth = ctx.request.body;
      if (PROJECT_ENV === 'beta') {
        const role: any = await authService.find(id);
        if (role.type === 1) {
          emitError({ ctx, code: 403, message: '测试环境不能操作默认权限!' });
          return;
        }
      }
      const hasAuth = await verifyUserAuth(ctx);
      if (!hasAuth) {
        emitError({ ctx, code: 403, error: '权限不足！' });
        return;
      }
      if (id === undefined) {
        throw new Error(`请传入id!`);
      }
      if (!c_auths || !c_auths.length) {
        throw new Error(`请传入要新增的子权限!`);
      }
      if (c_auths.includes(id)) {
        throw new Error(`父级权限不能在子权限里面!`);
      }
      const isExist = await authService.isExist([id, ...c_auths]);
      if (!isExist) {
        throw new Error(`${[id, ...c_auths].toString()}中存在不存在的权限!`);
      }
      const result1: any = await authService.findAllByInId(c_auths);
      const result2: number[] = result1.map((v) => v.p_id);
      const isUnique = arrayUnique(result2).length === 1;
      if (!isUnique) {
        throw new Error(`${c_auths.toString()}不是同一个父级权限!`);
      }
      await authService.updateMany(c_auths, id);
      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  };

  // 批量删除子权限
  batchDeleteChildAuths = async (ctx: ParameterizedContext, next) => {
    try {
      const { id, c_auths }: IAuth = ctx.request.body;
      if (PROJECT_ENV === 'beta') {
        const role: any = await authService.find(id);
        if (role.type === 1) {
          emitError({ ctx, code: 403, message: '测试环境不能操作默认权限!' });
          return;
        }
      }
      const hasAuth = await verifyUserAuth(ctx);
      if (!hasAuth) {
        emitError({ ctx, code: 403, error: '权限不足！' });
        return;
      }
      if (id === undefined) {
        throw new Error(`请传入id!`);
      }
      if (!c_auths || !c_auths.length) {
        throw new Error(`请传入要删除的子权限!`);
      }
      const isExist = await authService.isExist([id, ...c_auths]);
      if (!isExist) {
        throw new Error(`${[id, ...c_auths].toString()}中存在不存在的权限!`);
      }
      const all_child_auths: any = await authService.findByPid(id);
      const all_child_auths_id = all_child_auths.map((v) => v.id);
      const hasDiff = arrayGetDifference(c_auths, all_child_auths_id);
      if (hasDiff.length) {
        throw new Error(`${c_auths.toString()}中的权限父级id不是${id}!`);
      }
      const queue = [];
      c_auths.forEach((v) => {
        queue.push(this.commonGetAllChildAuth(v));
      });
      // 这是个二维数组
      const authRes = await Promise.all(queue);
      // 将二维数组拍平
      const authResFlat = authRes.flat();
      console.log([...authResFlat.map((v) => v.id), ...c_auths]);
      await authService.delete([...authResFlat.map((v) => v.id), ...c_auths]);
      successHandler({
        ctx,
        message: `删除成功，删除了${c_auths.length}个子权限和${authResFlat.length}个关联权限`,
      });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  };
}

export default new AuthController();
