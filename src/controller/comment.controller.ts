import { Context } from 'koa';

import errorHandler from '@/app/handler/error-handle';
import successHandler from '@/app/handler/success-handle';
import { IComment } from '@/interface';
import commentService from '@/service/comment.service';
import userService from '@/service/user.service';
import articleService from '@/service/article.service';
import positionService from '@/service/position.service';

class CommentController {
  async getArticleCommentList(ctx: Context, next) {
    try {
      const article_id = +ctx.params.article_id;
      const {
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'id',
      } = ctx.request.query;
      const result = await commentService.getArticleCommentList({
        article_id,
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
      const result = await commentService.find(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }

  async update(ctx: Context, next) {
    try {
      const id = +ctx.params.id;
      const { name, color }: IComment = ctx.request.body;
      const isExist = await commentService.isExist([id]);
      if (!isExist) {
        errorHandler({ ctx, code: 400, error: `不存在id为${id}的标签!` });
        return;
      }
      const result = await commentService.update({ id, name, color });
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }

  async create(ctx: Context, next) {
    try {
      const {
        article_id,
        from_user_id,
        to_user_id,
        to_comment_id,
        content,
      }: IComment = ctx.request.body;
      const articleIsExist =
        article_id === -1 ? true : await articleService.isExist([article_id]);
      if (!articleIsExist) {
        throw new Error(`不存在id为${article_id}的文章!`);
      }
      const commentIsExist =
        to_comment_id === -1
          ? true
          : await commentService.isExist([to_comment_id]);
      if (!commentIsExist) {
        throw new Error(`不存在id为${to_comment_id}的评论!`);
      }
      const userIsExist = await userService.isExist(
        [from_user_id, to_user_id].filter((v) => v !== -1)
      );
      if (!userIsExist) {
        throw new Error(
          `用户id:${[from_user_id, to_user_id]}中存在不存在的用户!`
        );
      }
      const ua = ctx.request.headers['user-agent'];
      const ip = (ctx.request.headers['x-real-ip'] as string) || '127.0.0.1';
      const ip_data = await positionService.get(ip);
      const result = await commentService.create({
        article_id,
        from_user_id,
        to_user_id,
        to_comment_id,
        content,
        ua,
        ip,
        ip_data: JSON.stringify(ip_data),
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }

  async getCommentList(ctx: Context, next) {
    try {
      const {
        childrenPageSize = '3',
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'created_at',
      }: any = ctx.request.query;
      const result = await commentService.getCommentList({
        childrenPageSize,
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

  /**
   * WARN:需要重新整理逻辑。
   */
  async getChildrenCommentList(ctx: Context, next) {
    try {
      const {
        article_id,
        to_comment_id,
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'created_at',
      }: any = ctx.request.query;
      const result = await commentService.getChildrenCommentList({
        article_id,
        to_comment_id,
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

  async delete(ctx: Context, next) {
    try {
      const id = +ctx.params.id;
      const isExist = await commentService.isExist([id]);
      if (!isExist) {
        errorHandler({ ctx, code: 400, error: `不存在id为${id}的标签!` });
        return;
      }
      const result = await commentService.delete(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new CommentController();
