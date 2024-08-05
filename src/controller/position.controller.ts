import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import positionService from '@/service/position.service';

class PositionController {
  async get(ctx: ParameterizedContext, next) {
    const realIp = ctx.request.headers['x-real-ip'] as string;
    const result = await positionService.get(realIp);
    successHandler({
      ctx,
      data: { gaode: result, ip: realIp || 'ip错误' },
    });
    await next();
  }
}

export default new PositionController();
