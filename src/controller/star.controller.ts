import { Context } from 'koa';

import errorHandler from '@/app/handler/error-handle';
import successHandler from '@/app/handler/success-handle';
import { IStar } from '@/interface';
import starService from '@/service/star.service';
import userService from '@/service/user.service';

class StarController {
  async getList(ctx: Context, next) {
    try {
      const {
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'id',
      } = ctx.request.query;
      const result = await starService.getList({
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
      const result = await starService.find(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }

  async update(ctx: Context, next) {
    try {
      const id = +ctx.params.id;
      const { article_id, to_user_id, from_user_id, comment_id }: IStar =
        ctx.request.body;
      const isExist = await starService.isExist([id]);
      if (!isExist) {
        errorHandler({ ctx, code: 400, error: `不存在id为${id}的star!` });
        return;
      }
      const result = await starService.update({
        id,
        article_id,
        to_user_id,
        from_user_id,
        comment_id,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }

  async create(ctx: Context, next) {
    try {
      const {
        article_id = -1,
        to_user_id = -1,
        from_user_id,
        comment_id = -1,
      }: IStar = ctx.request.body;
      const commentIsExist =
        comment_id === -1 ? true : await starService.isExist([comment_id]);
      if (!commentIsExist) {
        throw new Error(`不存在id为${comment_id}的评论!`);
      }
      const userIsExist = await userService.isExist([
        ...new Set([from_user_id, to_user_id].filter((v) => v !== -1)),
      ]);
      if (!userIsExist) {
        throw new Error(
          `用户id:${[from_user_id, to_user_id]}中存在不存在的用户!`
        );
      }
      const result = await starService.create({
        article_id,
        to_user_id,
        from_user_id,
        comment_id,
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
      const isExist = await starService.isExist([id]);
      if (!isExist) {
        errorHandler({ ctx, code: 400, error: `不存在id为${id}的star!` });
        return;
      }
      const result = await starService.delete(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }

  async deleteArticleStar(ctx: Context, next) {
    try {
      const { article_id, to_user_id, from_user_id, comment_id }: IStar =
        ctx.request.body;
      const result = await starService.delete(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new StarController();
