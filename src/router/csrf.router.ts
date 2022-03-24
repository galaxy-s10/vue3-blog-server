import Router from 'koa-router';

import successHandler from '@/app/handler/success-handle';

const csrfRouter = new Router({ prefix: '/csrf' });

csrfRouter.get('/get', (ctx, next) => {
  // ctx.status = 200;
  // ctx.body = { code: 200, data: 'ok' };
  // @ts-ignore
  successHandler({ ctx, data: 'ok' });
  return next();
});

export default csrfRouter;
