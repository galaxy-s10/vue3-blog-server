import { Context } from 'koa';

import emitError from '@/app/handler/emit-error';
import errorHandler from '@/app/handler/error-handle';
import successHandler from '@/app/handler/success-handle';
import articleTagService from '@/service/articleTag.service';

class ArticleTagController {
  async create(ctx: Context, next) {
    try {
      const prop = ctx.request.body;
      const result = await articleTagService.create(prop);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async getList(ctx: Context, next) {
    try {
      const result = await articleTagService.getList();
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new ArticleTagController();
