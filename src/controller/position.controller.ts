import { ParameterizedContext } from 'koa';

import successHandler from '@/app/handler/success-handle';
import positionService from '@/service/position.service';
import { strSlice } from '@/utils';

class PositionController {
  async get(ctx: ParameterizedContext, next) {
    const ip = strSlice(String(ctx.request.headers['x-real-ip']), 490);
    const result = await positionService.get(ip);
    successHandler({
      ctx,
      data: { gaode: result, ip: ip || 'ip错误' },
    });
    await next();
  }
}

export default new PositionController();
