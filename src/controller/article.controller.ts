// import themeModel from '../model/theme.model';
import { Context } from 'koa';
import errorHandler from '../app/error-handle';
import successHandler from '../app/success-handle';
import { emitError } from '../utils';
import articleService from '../service/article.service';

class ArticleController {
  async create(ctx: Context, next) {
    try {
      const prop = ctx.request.body;
      console.log(prop);
      const result = await articleService.create(prop);
      successHandler({ ctx, result });
      await next();
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
  }

  async list(ctx: Context, next) {
    try {
      const prop = ctx.request.body;
      const result = await articleService.getList(prop);
      successHandler({ ctx, result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error: error.message });
      await next();
    }
  }
}

export default new ArticleController();
