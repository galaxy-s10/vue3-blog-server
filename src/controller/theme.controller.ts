// import themeModel from '../model/theme.model';
import { Context } from 'koa';
import errorHandler from '../app/error-handle';
import successHandler from '../app/success-handle';
import { emitError } from '../utils';
import themeService from '../service/theme.service';

class ThemeController {
  async create(ctx: Context, next) {
    try {
      console.log('创建主题');
      const prop = ctx.request.body;
      const result = await themeService.create(prop);
      // successHandler({ ctx, result });
      console.log(result, 987);
      ctx.body = 'gdsg';
      console.log(ctx.body, 4343);
      // await next();
    } catch (error) {
      console.log('报错222');
      console.log(error);
      // console.log(ctx.body);
      // next();
      // console.log(2222, ctx.status, this);
      // console.log(ctx.body);
      // emitError({ ctx, code: 400, error });
      // ctx.status = 200;
      ctx.body = '2353555';

      // next();
    }
    // console.log('sdgsdg');
  }

  async list(ctx: Context, next) {
    try {
      const prop = ctx.request.body;
      const result = await themeService.getList(prop);
      console.log(
        result.rows[0].get({
          plain: true,
        })
      );

      successHandler({ ctx, result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error: error.message });
      await next();
    }
  }
}

const controller = new ThemeController();
export default controller;
