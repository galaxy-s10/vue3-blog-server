import { Context } from 'koa';

import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import { IType } from '@/interface';
import typeService from '@/service/type.service';

class TypeController {
  async getList(ctx: Context, next) {
    try {
      const {
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'id',
      } = ctx.request.query;
      const result = await typeService.getList({
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

  async find(ctx: Context, next) {
    try {
      const id = +ctx.params.id;
      const result = await typeService.find(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async update(ctx: Context, next) {
    try {
      const id = +ctx.params.id;
      const { name }: IType = ctx.request.body;
      const isExist = await typeService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的分类!` });
        return;
      }
      const result = await typeService.update({ id, name });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async create(ctx: Context, next) {
    try {
      const { name }: IType = ctx.request.body;
      const result = await typeService.create({ name });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async delete(ctx: Context, next) {
    try {
      const id = +ctx.params.id;
      const isExist = await typeService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的分类!` });
        return;
      }
      const result = await typeService.delete(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new TypeController();
