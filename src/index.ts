import path from 'path';

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import conditional from 'koa-conditional-get';
import etag from 'koa-etag';
import staticService from 'koa-static'; // CJS: require('koa-static')

import aliasOk from './app/alias';
import emitError from './app/handler/emit-error';
import errorHandler from './app/handler/error-handle';
import { connectDb } from './config/db';
import verifyHandler from './middleware/verify.middleware';
import useRoutes from './router/index';

import '@/utils/backupsDb';

aliasOk();

const { chalkSUCCESS } = require('@/app/chalkTip');

const app = new Koa();

const port = 3200;
app.use(conditional());
app.use(etag());

app.use(
  staticService(path.join(`${__dirname}/public/`), { maxage: 60 * 1000 }) // 静态目录的文件缓存一分钟
);

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

// 这个bodyParser有个问题，如果前端传的数据有误，经过这个中间件解析的时候，解析到错误了，还是会继续next()。
app.use(
  bodyParser({
    onerror: (error, ctx) => {
      emitError({ ctx, code: 500, error, message: 'body parse error' });
    },
  })
); // 注意顺序，需要在所有路由加载前解析

app.use(verifyHandler); // 注意顺序，需要在所有路由加载前进行接口验证

// @ts-ignore
app.useRoutes = useRoutes;

connectDb()
  .then(() => {
    // @ts-ignore
    app.useRoutes();
  })
  .catch((error) => {
    console.log(error);
  });

app.on('error', errorHandler); // 全局错误处理

app.listen(port, () => {
  console.log(chalkSUCCESS(`监听${port}端口成功!`));
});
