import { Context } from 'koa';

import { authJwt } from '@/app/authJwt';
import emitError from '@/app/handler/emit-error';
import errorHandler from '@/app/handler/error-handle';
import successHandler from '@/app/handler/success-handle';
import { IArticle } from '@/interface';
import articleService from '@/service/article.service';
import tagService from '@/service/tag.service';
import typeService from '@/service/type.service';
import userService from '@/service/user.service';

class ArticleController {
  async create(ctx: Context, next) {
    try {
      const {
        title,
        desc,
        header_img,
        is_comment,
        status,
        content,
        click,
        tag_ids,
        type_ids,
        user_ids,
      }: IArticle = ctx.request.body;
      const userIsExist = await userService.isExist(user_ids);
      if (!userIsExist) {
        throw new Error(`用户id:${user_ids}中存在不存在的用户!`);
      }
      const tagIsExist = await tagService.isExist(tag_ids);
      if (!tagIsExist) {
        throw new Error(`标签id:${tag_ids}中存在不存在的标签!`);
      }
      const typeIsExist = await typeService.isExist(type_ids);
      if (!typeIsExist) {
        throw new Error(`分类id:${type_ids}中存在不存在的分类!`);
      }
      const result = await articleService.create({
        title,
        desc,
        header_img,
        is_comment,
        status,
        content,
        click,
        tag_ids,
        type_ids,
        user_ids,
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
      const { code, userInfo } = await authJwt(ctx.request);
      let from_user_id = -1;
      if (code === 200) {
        from_user_id = userInfo.id;
      }
      const result = await articleService.find(id, from_user_id);
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }

  async getList(ctx: Context, next) {
    try {
      const {
        tag_ids = '',
        type_ids = '',
        user_ids = '',
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'id',
        status = '1',
      } = ctx.request.query;
      const isAdmin = ctx.req.url.indexOf('/admin/') !== -1;
      const result = await articleService.getList({
        tag_ids,
        type_ids,
        user_ids,
        nowPage,
        pageSize,
        orderBy,
        orderName,
        status: isAdmin ? status : 1,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }

  async getKeywordList(ctx: Context, next) {
    try {
      const {
        keyword = '',
        nowPage = '1',
        pageSize = '10',
        status = '1',
      } = ctx.request.query;
      const isAdmin = ctx.req.url.indexOf('/admin/') !== -1;
      const result = await articleService.getKeywordList({
        keyword,
        nowPage,
        pageSize,
        status: isAdmin ? status : 1,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new ArticleController();
