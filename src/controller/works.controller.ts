import { ParameterizedContext } from 'koa';

import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import successHandler from '@/app/handler/success-handle';
import { IList, IWorks } from '@/interface';
import { CustomError } from '@/model/customError.model';
import worksService from '@/service/works.service';
import { isAdmin } from '@/utils';

class WorksController {
  async getList(ctx: ParameterizedContext, next) {
    const {
      id,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
      status,
    }: IList<IWorks> = ctx.request.query;
    const result = await worksService.getList({
      id,
      orderBy,
      orderName,
      nowPage,
      pageSize,
      keyWord,
      status: isAdmin(ctx) ? status : 1,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await worksService.find(id);
    successHandler({ ctx, data: result });

    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(`权限不足！`, 403, 403);
    }
    const id = +ctx.params.id;
    const { name, desc, bg_url, priority, url, status }: IWorks =
      ctx.request.body;
    const isExist = await worksService.isExist([id]);
    if (!isExist) {
      throw new CustomError(`不存在id为${id}的作品！`, 400, 400);
    }
    await worksService.update({
      id,
      name,
      desc,
      bg_url,
      priority,
      url,
      status,
    });
    successHandler({ ctx });

    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(`权限不足！`, 403, 403);
    }
    const { name, desc, bg_url, priority, url, status }: IWorks =
      ctx.request.body;
    await worksService.create({
      name,
      desc,
      bg_url,
      priority,
      url,
      status,
    });
    successHandler({ ctx });

    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(`权限不足！`, 403, 403);
    }
    const id = +ctx.params.id;
    const isExist = await worksService.isExist([id]);
    if (!isExist) {
      throw new CustomError(`不存在id为${id}的作品！`, 400, 400);
    }
    await worksService.delete(id);
    successHandler({ ctx });

    await next();
  }
}

export default new WorksController();
