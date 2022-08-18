import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import { IComment } from '@/interface';
import articleService from '@/service/article.service';
import commentService from '@/service/comment.service';
import positionService from '@/service/position.service';
import userService from '@/service/user.service';
import { arrayUnique } from '@/utils';

class CommentController {
  // 评论列表
  async getList(ctx: ParameterizedContext, next) {
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

  // 文章评论列表
  async getArticleCommentList(ctx: ParameterizedContext, next) {
    try {
      const article_id = +ctx.params.article_id;
      const {
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'id',
      } = ctx.request.query;
      const { code, userInfo } = await authJwt(ctx);
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
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  // TODO
  async find(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      const result = await commentService.find(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  // TODO
  async update(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      const {
        article_id,
        to_user_id,
        parent_comment_id,
        reply_comment_id,
        content,
      }: IComment = ctx.request.body;
      const { userInfo } = await authJwt(ctx);
      const comment: any = await commentService.find(id);
      if (userInfo.id !== comment.from_user_id) {
        throw new Error(`你不能修改其他人的评论哦!`);
      }
      const isExist = await commentService.isExist([id]);
      if (!isExist) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的评论!` });
        return;
      }
      const result = await commentService.update({
        id,
        article_id,
        from_user_id: userInfo.id,
        to_user_id,
        parent_comment_id,
        reply_comment_id,
        content,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  // DONE 创建评论
  async create(ctx: ParameterizedContext, next) {
    try {
      const {
        article_id,
        to_user_id,
        parent_comment_id,
        reply_comment_id,
        content,
      }: IComment = ctx.request.body;
      if (parent_comment_id === -1 && to_user_id !== -1) {
        throw new Error(`不能在父评论里回复其他用户哦!`);
      }
      if (parent_comment_id === -1 && reply_comment_id !== -1) {
        throw new Error(`不能在父评论里回复其他评论哦!`);
      }
      const articleIsExist =
        article_id === -1 ? true : await articleService.isExist([article_id]);
      if (!articleIsExist) {
        throw new Error(`不存在id为${article_id}的文章!`);
      }
      const commentIdArr = arrayUnique(
        [parent_comment_id, reply_comment_id].filter((v) => v !== -1)
      );
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
      const { userInfo } = await authJwt(ctx);
      await commentService.create({
        article_id,
        from_user_id: userInfo.id,
        to_user_id,
        parent_comment_id,
        reply_comment_id,
        content,
        ua,
        ip,
        ip_data: JSON.stringify(ip_data),
      });
      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  // DONE 留言板评论列表
  async getCommentList(ctx: ParameterizedContext, next) {
    try {
      const {
        article_id = '-1',
        childrenPageSize = '3',
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'created_at',
      }: any = ctx.request.query;

      let from_user_id = -1;
      try {
        const { code, userInfo } = await authJwt(ctx);
        if (code === 200) {
          from_user_id = userInfo.id;
        }
      } catch (error) {
        console.log(error);
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

  // DONE 子评论列表
  async getChildrenCommentList(ctx: ParameterizedContext, next) {
    try {
      const {
        article_id,
        parent_comment_id,
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'created_at',
      }: any = ctx.request.query;

      let from_user_id = -1;
      try {
        const { code, userInfo } = await authJwt(ctx);
        if (code === 200) {
          from_user_id = userInfo.id;
        }
      } catch (error) {
        console.log(error);
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

  // DONE 获取该评论的所有子评论
  async commonGetAllChildrenComment(parent_comment_id) {
    const result: any = await commentService.findAllChildren(parent_comment_id);
    return result;
  }

  // DONE 父评论的所有子评论(不分页)
  getAllChildrenComment = async (ctx: ParameterizedContext, next) => {
    try {
      const id = +ctx.params.parent_comment_id;
      const isExist = await commentService.isExist([id]);
      if (!isExist) {
        throw new Error(`不存在id为${id}的评论!`);
      }
      const result: any = await this.commonGetAllChildrenComment(id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
      return;
    }
    await next();
  };

  // DONE
  delete = async (ctx: ParameterizedContext, next) => {
    try {
      const id = +ctx.params.id;
      const isExist = await commentService.isExist([id]);
      if (!isExist) {
        throw new Error(`不存在id为${id}的评论!`);
      }
      const { userInfo } = await authJwt(ctx);
      const comment: any = await commentService.find(id);
      if (userInfo.id !== comment.from_user_id) {
        throw new Error(`你不能删除其他人的评论哦!`);
      }
      let effect = 0;
      // 如果删的是父评论,
      if (comment.parent_comment_id === -1) {
        const allChildComment: any = await this.commonGetAllChildrenComment(id);
        // 如果父评论有子评论则删除子评论
        if (allChildComment.count !== 0) {
          effect = await commentService.deleteMany(
            allChildComment.rows.map((v) => v.id)
          );
        }
        // 最后再删父评论
        await commentService.delete(id);
      } else {
        // 如果删的是子评论
        await commentService.delete(id);
      }
      successHandler({
        ctx,
        message:
          effect === 0 ? '删除成功!' : `删除成功，一共删除${effect}条子评论!`,
      });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  };
}

export default new CommentController();
