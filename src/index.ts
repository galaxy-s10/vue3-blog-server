import Koa from 'koa';

import errorHandler from './app/error-handle';
import useRoutes from './router/index';
import { emitError } from './utils';
import authJwt from './utils/authJwt';

const bodyParser = require('koa-bodyparser');
const { _INFO } = require('./utils/chalkTip');

// const Koa = require('koa');

const app = new Koa();

const port = 3100;
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', '*');
  ctx.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Content-Length, Authorization, Accept, X-Requested-With , yourHeaderFeild'
  );
  ctx.set('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  if (ctx.method === 'OPTIONS') {
    ctx.body = 200;
  } else {
    await next();
  }
});
app.use(bodyParser()); // 注意顺序，需要在所有路由加载前解析

app.use(async (ctx, next) => {
  // try {
  console.log(_INFO(`↓↓↓↓↓↓↓↓↓↓ 监听${ctx.req.url}开始 ↓↓↓↓↓↓↓↓↓↓`));
  const jwtResult = await authJwt(ctx.req);
  const isAdmin = ctx.req.url.indexOf('/admin/') !== -1;
  if (isAdmin) {
    console.log('当前是后台接口');
    if (jwtResult.code !== 200) {
      emitError({
        ctx,
        code: jwtResult.code,
        error: jwtResult.message,
        message: jwtResult.message,
      });
    } else {
      next();
    }
  } else {
    console.log('当前是前台接口');
    next();
  }
  console.log(_INFO(`↑↑↑↑↑↑↑↑↑↑ 监听${ctx.req.url}结束 ↑↑↑↑↑↑↑↑↑↑`));
  // } catch (error) {
  //   // 代码逻辑报错也返回给前端，但这种情况开发时一般可以把握，不需要做这个兜底。
  //   ctx.status = 500;
  //   ctx.body = {
  //     code: 500,
  //     error: error.message,
  //   };
  // }
});
// @ts-ignore
app.useRoutes = useRoutes;
// @ts-ignore
app.useRoutes();

// app.use(themeRouter.routes()).use(themeRouter.allowedMethods());

// 接收错误
app.on('error', errorHandler);
app.listen(port, () => {
  console.log(_INFO(`监听${port}端口成功`));
});
