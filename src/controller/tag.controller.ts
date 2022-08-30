import { ParameterizedContext } from 'koa';

import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import successHandler from '@/app/handler/success-handle';
import { IList, ITag } from '@/interface';
import { CustomError } from '@/model/customError.model';
import tagService from '@/service/tag.service';

class TagController {
  async getList(ctx: ParameterizedContext, next) {
    const {
      id,
      orderBy = 'asc',
      orderName = 'id',
      nowPage,
      pageSize,
      keyWord,
    }: IList<ITag> = ctx.request.query;
    const result = await tagService.getList({
      nowPage,
      pageSize,
      orderBy,
      orderName,
      keyWord,
      id,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  async find(ctx: ParameterizedContext, next) {
    const id = +ctx.params.id;
    const result = await tagService.find(id);
    successHandler({ ctx, data: result });

    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(`权限不足！`, 403, 403);
    }
    const id = +ctx.params.id;
    const { name, color }: ITag = ctx.request.body;
    const isExist = await tagService.isExist([id]);
    if (!isExist) {
      throw new CustomError(`不存在id为${id}的标签！`, 400, 400);
    }
    await tagService.update({ id, name, color });
    successHandler({ ctx });

    await next();
  }

  async create(ctx: ParameterizedContext, next) {
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(`权限不足！`, 403, 403);
    }
    const { name, color }: ITag = ctx.request.body;
    await tagService.create({ name, color });
    successHandler({ ctx });

    await next();
  }

  async getArticleList(ctx: ParameterizedContext, next) {
    const tag_id = +ctx.params.tag_id;
    const { nowPage, pageSize = '10' }: any = ctx.request.query;
    const result = await tagService.getArticleList({
      tag_id,
      nowPage,
      pageSize,
    });
    successHandler({ ctx, data: result });

    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    const hasAuth = await verifyUserAuth(ctx);
    if (!hasAuth) {
      throw new CustomError(`权限不足！`, 403, 403);
    }
    const id = +ctx.params.id;
    const isExist = await tagService.isExist([id]);
    if (!isExist) {
      throw new CustomError(`不存在id为${id}的标签！`, 400, 400);
    }
    await tagService.delete(id);
    successHandler({ ctx });

    await next();
  }
}

export default new TagController();
