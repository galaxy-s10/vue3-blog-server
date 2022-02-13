import { Context } from 'koa';

import errorHandler from '@/app/handler/error-handle';
import successHandler from '@/app/handler/success-handle';
import roleAuthService from '@/service/roleAuth.service';

class RoleAuthController {
  async getList(ctx: Context, next) {
    try {
      const result = await roleAuthService.getList();
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new RoleAuthController();
