import { Context } from 'koa';
import errorHandler from '../app/error-handle';
import successHandler from '../app/success-handle';
import { emitError } from '../utils';
import userService from '../service/user.service';

class UserController {
  async create(ctx: Context, next) {
    console.log('创建用户');
    try {
      const prop = ctx.request.body;
      const result = await userService.create(prop);
      successHandler({ ctx, result });
      await next();
    } catch (error) {
      console.log('zzz');
      ctx.body = { a: 3534 };
      emitError({ ctx, code: 400, error: 'sd' });
      // console.log(3223);
      // await next(11);
    }
  }

  async list(ctx: Context, next) {
    try {
      const prop = ctx.request.body;
      const result = await userService.getList(prop);
      successHandler({ ctx, result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error: error.message });
      await next();
    }
  }
}

export default new UserController();
