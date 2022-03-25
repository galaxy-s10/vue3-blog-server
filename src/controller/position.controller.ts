import { ParameterizedContext } from 'koa';

import emitError from '@/app/handler/emit-error';
import successHandler from '@/app/handler/success-handle';
import positionService from '@/service/position.service';

class PositionController {
  async get(ctx: ParameterizedContext, next) {
    try {
      const result = await positionService.get(
        ctx.request.headers['x-real-ip'] as string
      );
      successHandler({ ctx, data: result });
    } catch (error) {
      emitError({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new PositionController();
