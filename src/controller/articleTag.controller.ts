import { Context } from 'koa';
import errorHandler from '../app/error-handle';
import successHandler from '../app/success-handle';
import { emitError } from '../utils';
import articleTagService from '../service/articleTag.service';

class ArticleTagController {
  async create(ctx: Context, next) {
    try {
      const prop = ctx.request.body;
      console.log(prop);
      const result = await articleTagService.create(prop);
      successHandler({ ctx, result });
      await next();
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
  }

  async list(ctx: Context, next) {
    try {
      const prop = ctx.request.body;
      const result = await articleTagService.getList(prop);
      successHandler({ ctx, result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error: error.message });
      await next();
    }
  }
}

export default new ArticleTagController();
