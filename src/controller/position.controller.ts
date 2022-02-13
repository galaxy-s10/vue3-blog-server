import { Context } from 'koa';

import errorHandler from '@/app/handler/error-handle';
import successHandler from '@/app/handler/success-handle';
import positionService from '@/service/position.service';

class PositionController {
  async get(ctx: Context, next) {
    try {
      const result = await positionService.get(
        ctx.request.headers['x-real-ip'] as string
      );
      successHandler({ ctx, data: result });
    } catch (error) {
      errorHandler({ ctx, code: 400, error });
    }
    await next();
  }
}

export default new PositionController();
