// import themeModel from '../model/theme.model';
import { Context } from 'koa';

import { emitError } from '@/app/handler/emit-error';
import errorHandler from '@/app/handler/error-handle';
import successHandler from '@/app/handler/success-handle';
import themeService from '@/service/theme.service';

const fn2 = async () => {
  console.log('dddd');
  const xx = await new Promise((res, rej) => {
    setTimeout(() => {
      console.log('fn2');
      res(100);
    }, 1000);
  });
  return xx;
};
class ThemeController {
  async create(ctx: Context, next) {
    try {
      console.log('创建主题');
      const prop = ctx.request.body;
      ctx.body = '1111';

      // const result = await fn2();
      const result = await themeService.create(prop);
      console.log(result, 987);
      ctx.body = result;
      console.log(ctx.body, 4343);
      // await next();
    } catch (error) {
      console.log('报错222');
      console.log(error);
      // console.log(ctx.body);
      // next();
      // console.log(2222, ctx.status, this);
      // console.log(ctx.body);
      emitError({ ctx, code: 400, error });
      // ctx.status = 200;

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

      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error: error.message });
      await next();
    }
  }
}

const controller = new ThemeController();
export default controller;
