import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import { verifyUserAuth } from '@/app/auth/verifyUserAuth';
import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import { IArticle } from '@/interface';
import articleService from '@/service/article.service';
import tagService from '@/service/tag.service';
import typeService from '@/service/type.service';
import { arrayUnique } from '@/utils';

class ArticleController {
  async create(ctx: ParameterizedContext, next) {
    try {
      const {
        title,
        desc,
        head_img,
        is_comment,
        status,
        content,
        priority,
        types,
        tags,
      }: IArticle = ctx.request.body;
      const { userInfo } = await authJwt(ctx);
      const tagIsExist = await tagService.isExist(arrayUnique(tags));
      if (!tagIsExist) {
        throw new Error(`标签id:${tags}中存在不存在的标签!`);
      }
      const typeIsExist = await typeService.isExist(arrayUnique(types));
      if (!typeIsExist) {
        throw new Error(`分类id:${types}中存在不存在的分类!`);
      }
      const result: any = await articleService.create({
        title,
        desc,
        head_img,
        is_comment,
        status,
        content,
        priority,
      });
      // eslint-disable-next-line
      tags && (await result.setTags(tags));
      // eslint-disable-next-line
      types && (await result.setTypes(types));
      await result.setUsers([userInfo.id]);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async update(ctx: ParameterizedContext, next) {
    try {
      const hasAuth = await verifyUserAuth(ctx);
      if (!hasAuth) {
        emitError({ ctx, code: 403, error: '权限不足！' });
        return;
      }
      const id = +ctx.params.id;
      const {
        title,
        desc,
        is_comment,
        priority,
        status,
        head_img,
        content,
        tags = [],
        types = [],
      }: IArticle = ctx.request.body;
      const article: any = await articleService.find(id);
      if (!article) {
        throw new Error(`不存在id为${id}的文章!`);
      }
      const isExistTag = await tagService.isExist(tags);
      if (!isExistTag) {
        throw new Error(`不存在id为${id}的标签!`);
      }
      const isExistType = await typeService.isExist(types);
      if (!isExistType) {
        throw new Error(`不存在id为${id}的分类!`);
      }
      await articleService.update({
        id,
        title,
        desc,
        is_comment,
        priority,
        status,
        head_img,
        content,
      });
      article.setTypes(types);
      article.setTags(tags);
      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async find(ctx: ParameterizedContext, next) {
    try {
      const id = +ctx.params.id;
      let from_user_id = -1;
      try {
        const { code, userInfo } = await authJwt(ctx);
        if (code === 200) {
          from_user_id = userInfo.id;
        }
        // eslint-disable-next-line no-empty
      } catch (error) {}
      const result = await articleService.findArticleDetail(id, from_user_id);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async getList(ctx: ParameterizedContext, next) {
    try {
      const {
        id,
        tags = '',
        types = '',
        users = '',
        nowPage = '1',
        pageSize = '10',
        orderBy = 'asc',
        orderName = 'id',
        status = '1',
        keyWord,
      } = ctx.request.query;
      const isAdmin = ctx.req.url.indexOf('/admin/') !== -1;
      const result = await articleService.getList({
        id,
        tags,
        types,
        users,
        nowPage,
        pageSize,
        orderBy,
        orderName,
        status: isAdmin ? status : 1,
        keyWord,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async getKeyWordList(ctx: ParameterizedContext, next) {
    try {
      const {
        keyWord,
        nowPage = '1',
        pageSize = '10',
        status = '1',
      } = ctx.request.query;
      const isAdmin = ctx.req.url.indexOf('/admin/') !== -1;
      const result = await articleService.getKeyWordList({
        keyWord,
        nowPage,
        pageSize,
        status: isAdmin ? status : 1,
      });
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async delete(ctx: ParameterizedContext, next) {
    try {
      const hasAuth = await verifyUserAuth(ctx);
      if (!hasAuth) {
        emitError({ ctx, code: 403, error: '权限不足！' });
        return;
      }
      const id = +ctx.params.id;
      const article: any = await articleService.find(id);
      if (!article) {
        emitError({ ctx, code: 400, error: `不存在id为${id}的文章!` });
        return;
      }
      article.setTypes([]);
      article.setTags([]);
      await articleService.delete(id);
      successHandler({ ctx });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new ArticleController();
