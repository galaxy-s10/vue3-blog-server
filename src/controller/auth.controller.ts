import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import { IAuth } from '@/interface';
import authService from '@/service/auth.service';
import { arrayToTree } from '@/utils';

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

  async getAllList(ctx: ParameterizedContext, next) {
    try {
      const result = await authService.getAllList();
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

      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async commonGetMyAuth(ctx: ParameterizedContext) {
    const { userInfo } = await authJwt(ctx);
    const result: any = await authService.getMyAuth(userInfo.id);
    // const auths = [];
    // const res = result.get();
    // res.roles.forEach((item) => {
    //   auths.push(...item.auths);
    // });
    // res.auths = auths;
    // delete res.roles;
    return result;
  }

  // 获取我的所有权限
  getMyAuth = async (ctx: ParameterizedContext, next) => {
    try {
      const result = await this.commonGetMyAuth(ctx);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  };

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
      if (id === 1 && p_id !== 0) {
        throw new Error(`不能修改根权限的p_id哦!`);
      }
      if (id !== 1 && p_id === 0) {
        throw new Error(`不能给其他权限设置为根权限哦!`);
      }
      const ids = [p_id, id].filter((v) => v !== 0);
      if (!ids.length) {
        throw new Error(`${[p_id, id]}中存在不存在的角色!`);
      }
      const isExistAuth = p_id === 0 ? true : await authService.isExist([id]);
      if (!isExistAuth) {
        throw new Error(`不存在id为${id}的角色!`);
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

  /** 获取该权限的所有子权限(树型)，一层层的递归找到所有子孙节点 */
  async commonGetAllChildAuth(id) {
    const allAuth = [];
    // eslint-disable-next-line no-shadow
    // const getChildAuth = async (id: number) => {
    //   const c: any = await authService.findAllChildren(id);
    //   allAuth.push(...c);
    //   for (let i = 0; i < c.length; i += 1) {
    //     const item = c[i];
    //     await getChildAuth(item.id);
    //   }
    // };
    const queue = [];
    // eslint-disable-next-line no-shadow
    const getChildAuth = async (id: number) => {
      const c: any = await authService.findAllChildren(id);
      allAuth.push(...c);
      for (let i = 0; i < c.length; i += 1) {
        const item = c[i];
        queue.push(getChildAuth(item.id));
      }
    };
    await getChildAuth(id);
    await Promise.all(queue);
    return allAuth;
  }

  /** 获取该权限的直接子权限（只找一层） */
  getChildAuth = async (ctx: ParameterizedContext, next) => {
    try {
      const id = +ctx.params.id;
      const isExist = await authService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的权限!` });
        return;
      }
      const result = await authService.findByPid(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  };

  /** 获取该权限的直接子权限（递归查找所有） */
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

  // 获取树型角色
  async getTreeList(ctx: ParameterizedContext, next) {
    try {
      const { id = 0 } = ctx.request.query;
      const { rows } = await authService.getAllList();
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

  // 递归删除
  delete = async (ctx: ParameterizedContext, next) => {
    try {
      const id = +ctx.params.id;
      const auth: any = await authService.find(id);
      if (auth.p_id === 0) {
        throw new Error(`不能删除根权限哦!`);
      }
      if (!auth) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的权限!` });
        return;
      }
      const all_auth: any = await this.commonGetAllChildAuth(id);
      const all_auth_ids = all_auth.map((item) => item.id);
      await authService.delete([id, ...all_auth_ids]);
      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  };
}

export default new AuthController();
