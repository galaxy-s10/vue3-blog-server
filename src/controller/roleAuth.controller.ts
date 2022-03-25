import { ParameterizedContext } from 'koa';

import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import roleAuthService from '@/service/roleAuth.service';

class RoleAuthController {
  async getList(ctx: ParameterizedContext, next) {
    try {
      const result = await roleAuthService.getList();
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new RoleAuthController();
