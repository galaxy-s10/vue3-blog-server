import path from 'path';

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import conditional from 'koa-conditional-get';
import convert from 'koa-convert';
import CSRF from 'koa-csrf';
import etag from 'koa-etag';
import session from 'koa-generic-session';
import staticService from 'koa-static';

import aliasOk from './app/alias';
import errorHandler from './app/handler/error-handle';
import { connectDb } from './config/db';
import verifyMiddleware from './middleware/verify.middleware';
import useRoutes from './router/index';

aliasOk(); // 添加别名路径

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

// set the session keys
// app.keys = [Math.random().toString(36).slice(2)];
app.keys = ['aaaa', 'bbb', 'ccc'];

// add session support
app.use(
  convert(
    session({
      key: 'session-csrf', // cookie 名称默认为koa.sid
      cookie: {
        path: '/',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 单位毫秒
        overwrite: true,
        /**
         * 如果设置true，即加密cookie，则app.keys必须设置值，否则会报错。而且如果设置true，另一个同名的cookie。附加的sig后缀也将被发送
         * 如果设置false，即cookie不加密，不用设置app.keys
         */
        signed: true,
      },
    })
  )
);

// 这个bodyParser有个问题，如果前端传的数据有误，经过这个中间件解析的时候，解析到错误了，还是会继续next()。
app.use(
  bodyParser({
    onerror: (error, ctx) => {
      console.log('bodyParser解析错误', error);
      ctx.status = 400;
      ctx.res.end('bodyParser解析错误');
    },
  })
); // 注意顺序，需要在所有路由加载前解析

// add the CSRF middleware
app.use(
  new CSRF({
    invalidTokenMessage: '不允许跨站请求!',
    invalidTokenStatusCode: 403,
    excludedMethods: ['GET', 'HEAD', 'OPTIONS'], // 这三个方法不需要验证
    disableQuery: false,
  })
);
// const ccc = new CSRF({
//   invalidTokenMessage: '不允许跨站请求!',
//   invalidTokenStatusCode: 403,
//   excludedMethods: ['GET', 'HEAD', 'OPTIONS'], // 这三个方法不需要验证
//   disableQuery: false,
// });

// console.log(ccc);

app.use(verifyMiddleware); // 注意顺序，需要在所有路由加载前进行接口验证

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
