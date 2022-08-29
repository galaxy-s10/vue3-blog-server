import { createServer } from 'http';
import path from 'path';

import fs from 'fs-extra';
import Koa from 'koa';
import koaBody from 'koa-body';
import conditional from 'koa-conditional-get';
import etag from 'koa-etag';
import staticService from 'koa-static';

import aliasOk from './app/alias'; // 这个后面的代码才能用@别名
import { monit } from './monit';

import { chalkINFO, chalkSUCCESS } from '@/app/chalkTip';
import errorHandler from '@/app/handler/error-handle';
import { connectDb } from '@/config/db';
import { connectRedis } from '@/config/redis';
import { PROJECT_ENV, PROJECT_NAME, PROJECT_PORT } from '@/constant';
import { gobalVerify } from '@/middleware/verify.middleware';
import { useRoutes } from '@/router';
import { handleSecretFile } from '@/utils/handleSecret';
import { initDb } from '@/utils/initDb';
import { initWs } from '@/websocket';

aliasOk(); // 添加别名路径
handleSecretFile(); // 处理config/secret.ts秘钥文件

const app = new Koa();
app.use(conditional()); // 接口缓存
app.use(etag()); // 接口缓存

const staticDir = path.join(__dirname, './public/'); // 静态目录
const uploadDir = path.join(__dirname, './upload/'); // 上传文件接口接收到的文件存放的目录
fs.ensureDirSync(uploadDir);

app.use(
  staticService(staticDir, { maxage: 60 * 1000 }) // 静态目录的文件缓存一分钟
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

app.use(
  koaBody({
    multipart: true,
    formidable: {
      // 上传目录
      uploadDir, // 默认os.tmpdir()
      // 保留文件扩展名
      keepExtensions: true,
    },
    strict: true, // 如果启用，则不解析 GET、HEAD、DELETE 请求，默认true。即delete不会解析data数据
  })
);

// 这个bodyParser有个问题，如果前端传的数据有误，经过这个中间件解析的时候，解析到错误了，还是会继续next()。
// app.use(
//   bodyParser({
//     onerror: (error, ctx) => {
//       console.log('bodyParser解析错误', error);
//       ctx.status = 400;
//       ctx.res.end('bodyParser解析错误');
//     },
//   })
// ); // 注意顺序，需要在所有路由加载前解析

app.use(gobalVerify); // 注意顺序，需要在所有路由加载前进行接口验证

useRoutes(app);

app.on('error', errorHandler); // 全局错误处理

const port = +PROJECT_PORT; // 端口

const httpServer = createServer(app.callback());

initWs(httpServer); // websocket
// monit(); // 监控

httpServer.listen(port, () => {
  console.log(chalkINFO(`当前监听的端口: ${port}`));
  console.log(chalkINFO(`当前的项目名称: ${PROJECT_NAME}`));
  console.log(chalkINFO(`当前的项目环境: ${PROJECT_ENV}`));
  connectDb()
    .then(() => {
      initDb(3);
      console.log(chalkSUCCESS('所有路由加载完成!'));
    })
    .catch((err) => {
      console.log(err);
    });

  connectRedis();
});
