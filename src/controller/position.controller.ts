import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import positionService from '@/service/position.service';

class PositionController {
  async get(ctx: ParameterizedContext, next) {
    const result = await positionService.get(
      ctx.request.headers['x-real-ip'] as string
    );
    successHandler({ ctx, data: result });
    await next();
  }
}

export default new PositionController();
