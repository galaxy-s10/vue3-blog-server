import { ParameterizedContext } from 'koa';
import Router from 'koa-router';

import successHandler from '@/app/handler/success-handle';

const csrfRouter = new Router({ prefix: '/csrf' });

csrfRouter.get('/get', (ctx: ParameterizedContext, next) => {
  // ctx.status = 200;
  // ctx.body = { code: 200, data: 'ok' };
  successHandler({ ctx, data: 'ok' });
  return next();
});

export default csrfRouter;
