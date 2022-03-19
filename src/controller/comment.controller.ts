import { Context } from 'koa';

import { authJwt } from '@/app/authJwt';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import { IComment } from '@/interface';
import articleService from '@/service/article.service';
import commentService from '@/service/comment.service';
import positionService from '@/service/position.service';
import userService from '@/service/user.service';

class CommentController {
  async getList(ctx: Context, next) {
    try {
      const {
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'id',
      } = ctx.request.query;
      const result = await commentService.getList({
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

  async getArticleCommentList(ctx: Context, next) {
    try {
      const article_id = +ctx.params.article_id;
      const {
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'id',
      } = ctx.request.query;
      const { code, userInfo } = await authJwt(ctx.request);
      let from_user_id = -1;
      if (code === 200) {
        from_user_id = userInfo.id;
      }
      const result = await commentService.getArticleCommentList({
        article_id,
        nowPage,
        pageSize,
        orderBy,
        orderName,
        from_user_id,
      });
      successHandler({ ctx, data: result });
      // const {
      //   nowPage = '1',
      //   pageSize = '10',
      //   orderBy = 'asc',
      //   orderName = 'id',
      // } = ctx.request.query;
      // const result = await commentService.getArticleCommentList({
      //   article_id,
      //   nowPage,
      //   pageSize,
      //   orderBy,
      //   orderName,
      // });
      // successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async find(ctx: Context, next) {
    try {
      const id = +ctx.params.id;
      const result = await commentService.find(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async update(ctx: Context, next) {
    try {
      const id = +ctx.params.id;
      const { name, color }: IComment = ctx.request.body;
      const isExist = await commentService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的标签!` });
        return;
      }
      const result = await commentService.update({ id, name, color });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async create(ctx: Context, next) {
    try {
      const {
        article_id,
        to_user_id,
        parent_comment_id,
        reply_comment_id,
        content,
      }: IComment = ctx.request.body;
      const { code, userInfo } = await authJwt(ctx.request);
      let from_user_id = -1;
      if (code === 200) {
        from_user_id = userInfo.id;
      }
      const articleIsExist =
        article_id === -1 ? true : await articleService.isExist([article_id]);
      if (!articleIsExist) {
        throw new Error(`不存在id为${article_id}的文章!`);
      }
      const commentIdArr = [
        ...new Set(
          [parent_comment_id, reply_comment_id].filter((v) => v !== -1)
        ),
      ];
      const commentIsExist =
        commentIdArr.length === 0
          ? true
          : await commentService.isExist(commentIdArr);
      if (!commentIsExist) {
        throw new Error(`不存在id为${commentIdArr}的评论!`);
      }
      const userIsExist =
        to_user_id === -1 ? true : await userService.isExist([to_user_id]);
      if (!userIsExist) {
        throw new Error(`不存在id为${[to_user_id]}的用户!`);
      }
      const ua = ctx.request.headers['user-agent'];
      const ip = (ctx.request.headers['x-real-ip'] as string) || '127.0.0.1';
      const ip_data = await positionService.get(ip);
      const result = await commentService.create({
        article_id,
        from_user_id,
        to_user_id,
        parent_comment_id,
        reply_comment_id,
        content,
        ua,
        ip,
        ip_data: JSON.stringify(ip_data),
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async getCommentList(ctx: Context, next) {
    try {
      const {
        article_id = '-1',
        childrenPageSize = '3',
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'created_at',
      }: any = ctx.request.query;
      const { code, userInfo } = await authJwt(ctx.request);
      let from_user_id = -1;
      if (code === 200) {
        from_user_id = userInfo.id;
      }
      const result = await commentService.getCommentList({
        childrenPageSize,
        nowPage,
        pageSize,
        orderBy,
        orderName,
        from_user_id,
        article_id,
      });
      successHandler({ ctx, data: { ...result } });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async getChildrenCommentList(ctx: Context, next) {
    try {
      const {
        article_id,
        parent_comment_id,
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'created_at',
      }: any = ctx.request.query;
      const { code, userInfo } = await authJwt(ctx.request);
      let from_user_id = -1;
      if (code === 200) {
        from_user_id = userInfo.id;
      }
      const result = await commentService.getChildrenCommentList({
        nowPage,
        pageSize,
        orderBy,
        orderName,
        from_user_id,
        parent_comment_id,
        article_id,
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
      const isExist = await commentService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的标签!` });
        return;
      }
      const result = await commentService.delete(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new CommentController();
