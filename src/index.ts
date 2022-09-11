import fs from 'fs-extra';
import Koa from 'koa';
import koaBody from 'koa-body';
import conditional from 'koa-conditional-get';
import etag from 'koa-etag';
import staticService from 'koa-static';

import aliasOk from './app/alias'; // 这个后面的代码才能用@别名
import { CustomError } from './model/customError.model';

import { catchErrorMiddle, corsMiddle } from '@/app/app.middleware';
import errorHandler from '@/app/handler/error-handle';
import { apiBeforeVerify } from '@/app/verify.middleware';
import { connectMysql } from '@/config/db';
import { connectRedis } from '@/config/redis';
import {
  PROJECT_ENV,
  PROJECT_NAME,
  PROJECT_PORT,
  staticDir,
  uploadDir,
} from '@/constant';
import { monit } from '@/monit';
import { loadAllRoutes } from '@/router';
import { chalkERROR, chalkSUCCESS, chalkWARN } from '@/utils/chalkTip';
import { handleSecretFile } from '@/utils/handleSecret';
import { initDb } from '@/utils/initDb';
// import { initWs } from '@/websocket';

const port = +PROJECT_PORT; // 端口

aliasOk(); // 添加别名路径
handleSecretFile(); // 处理config/secret.ts秘钥文件

fs.ensureDirSync(uploadDir);

const app = new Koa();

app.use(catchErrorMiddle); // 全局错误处理

app.use(
  koaBody({
    multipart: true,
    formidable: {
      // 上传目录
      uploadDir, // 默认os.tmpdir()
      // 保留文件扩展名
      keepExtensions: true,
      maxFileSize: 1024 * 1024 * 300, // 300m
      onFileBegin(name, file) {
        // file.filepath ='可覆盖地址'
        console.log(file, '------');
      },
    },
    onError(err) {
      console.log('koaBody错误', err);
      throw new CustomError(err.message, 500, 500);
    },
    // parsedMethods: ['POST', 'PUT', 'PATCH', 'GET', 'HEAD', 'DELETE'], // 声明将解析正文的 HTTP 方法，默认值['POST', 'PUT', 'PATCH']。替换strict选项。
    // strict: true, // 废弃了。如果启用，则不解析 GET、HEAD、DELETE 请求，默认true。即delete不会解析data数据
  })
); // 解析参数

app.use(
  staticService(staticDir, { maxage: 60 * 1000 }) // 静态文件目录（缓存时间：1分钟）
);

app.use(conditional()); // 接口缓存
app.use(etag()); // 接口缓存
app.use(corsMiddle); // 设置允许跨域

app.on('error', errorHandler); // 接收全局错误，位置必须得放在最开头？

// initWs(httpServer); // websocket

async function main() {
  try {
    initDb(3); // 加载sequelize的relation表关联
    await connectMysql(); // 连接mysql
    await connectRedis(); // 连接redis
    app.use(apiBeforeVerify); // 注意：需要在所有路由加载前使用这个中间件
    loadAllRoutes(app); // 加载所有路由
    monit(); // 监控
    await new Promise((resolve) => {
      // 语法糖, 等同于http.createServer(app.callback()).listen(3000);
      app.listen(port, () => {
        resolve('ok');
      });
    }); // http接口服务
    console.log(chalkSUCCESS(`项目启动成功！`));
    console.log(chalkWARN(`当前监听的端口: ${port}`));
    console.log(chalkWARN(`当前的项目名称: ${PROJECT_NAME}`));
    console.log(chalkWARN(`当前的项目环境: ${PROJECT_ENV}`));
  } catch (error) {
    console.log(chalkERROR(`项目启动失败！`));
    console.log(error);
  }
}

main();
