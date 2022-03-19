import { Context } from 'koa';

import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import { IWorks } from '@/interface';
import worksService from '@/service/works.service';

class worksController {
  async getList(ctx: Context, next) {
    try {
      const {
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'id',
        status = '1',
      } = ctx.request.query;
      const isAdmin = ctx.req.url.indexOf('/admin/') !== -1;
      const result = await worksService.getList({
        nowPage,
        pageSize,
        orderBy,
        orderName,
        status: isAdmin ? status : 1,
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
      const result = await worksService.find(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async update(ctx: Context, next) {
    try {
      const id = +ctx.params.id;
      const { name, desc, bg_url, priority, url, status }: IWorks =
        ctx.request.body;
      const isExist = await worksService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的友链!` });
        return;
      }
      const result = await worksService.update({
        id,
        name,
        desc,
        bg_url,
        priority,
        url,
        status,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async create(ctx: Context, next) {
    try {
      const { name, desc, bg_url, priority, url, status }: IWorks =
        ctx.request.body;
      const isAdmin = ctx.req.url.indexOf('/admin/') !== -1;
      const result = await worksService.create({
        name,
        desc,
        bg_url,
        priority,
        url,
        status: isAdmin ? status : 1,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async delete(ctx: Context, next) {
    try {
      const id = +ctx.params.id;
      const isExist = await worksService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的友链!` });
        return;
      }
      const result = await worksService.delete(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new worksController();
