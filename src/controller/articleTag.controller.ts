import { ParameterizedContext } from 'koa';

import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import articleTagService from '@/service/articleTag.service';

class ArticleTagController {
  async create(ctx: ParameterizedContext, next) {
    try {
      const prop = ctx.request.body;
      const result = await articleTagService.create(prop);
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }

  async getList(ctx: ParameterizedContext, next) {
    try {
      const result = await articleTagService.getList();
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new ArticleTagController();
