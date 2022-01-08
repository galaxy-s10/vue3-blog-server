import Koa from 'koa';
// const Koa = require('koa');
import aliasOk from './app/alias';
import errorHandler from './app/handler/error-handle';
import verifyHandler from './middleware/verify.middleware';
import useRoutes from './router/index';

aliasOk();

const bodyParser = require('koa-bodyparser');
const { _INFO } = require('@/app/chalkTip');

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

app.use(verifyHandler); // 全局接口验证

// @ts-ignore
app.useRoutes = useRoutes;
// @ts-ignore
app.useRoutes();

app.on('error', errorHandler); // 全局错误处理

app.listen(port, () => {
  console.log(_INFO(`监听${port}端口成功!`));
});
