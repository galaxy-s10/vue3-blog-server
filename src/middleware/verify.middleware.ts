import { Context } from 'koa';

import { authJwt } from '@/app/authJwt';
import { chalkINFO } from '@/app/chalkTip';
import emitError from '@/app/handler/emit-error';

const whiteList = [
  '/init/role',
  '/init/auth',
  '/init/roleAuth',
  '/init/dayData',
  '/visitor_log/create',
  '/link/create',
];

const verify = async (ctx: Context, next) => {
  const url = ctx.request.path;
  console.log(
    chalkINFO(
      `↓↓↓↓↓↓↓↓↓↓ ${new Date().toLocaleString()} 监听 ${
        ctx.request.method
      } ${url} 开始 ↓↓↓↓↓↓↓↓↓↓`
    )
  );
  try {
    const isAdmin = ctx.req.url.indexOf('/admin/') !== -1;
    if (isAdmin) {
      console.log(chalkINFO('当前请求的是后台接口'));
      const jwtResult = await authJwt(ctx.req);
      if (jwtResult.code !== 200) {
        emitError({
          ctx,
          code: jwtResult.code,
          error: jwtResult.message,
          message: jwtResult.message,
        });
      } else {
        /**
         * 这里必须await next()，因为路由匹配肯定是先匹配这个app.use的，
         * 如果这里匹配完成后直接next()了，就会返回数据了（404），也就是不会
         * 继续走后面的匹配了！但是如果加了await，就会等待后面的继续匹配完！
         */
        await next();
      }
    } else {
      console.log(chalkINFO('当前请求的是前台接口'));
      if (ctx.request.method === 'GET' || whiteList.indexOf(url) !== -1) {
        await next();
      } else {
        const jwtResult = await authJwt(ctx.req);
        if (jwtResult.code !== 200) {
          emitError({
            ctx,
            code: jwtResult.code,
            error: jwtResult.message,
            message: jwtResult.message,
          });
        } else {
          /**
           * 这里必须await next()，因为路由匹配肯定是先匹配这个app.use的，
           * 如果这里匹配完成后直接next()了，就会返回数据了（404），也就是不会
           * 继续走后面的匹配了！但是如果加了await，就会等待后面的继续匹配完！
           */
          await next();
        }
      }
    }
  } catch (error) {
    // 代码逻辑报错也返回给前端，但这种情况开发时一般可以把握，不需要做这个兜底。
    ctx.status = 500;
    ctx.body = {
      code: 500,
      error: error.message,
    };
  }
  console.log(
    chalkINFO(
      `↑↑↑↑↑↑↑↑↑↑ ${new Date().toLocaleString()} 监听 ${
        ctx.request.method
      } ${url} 结束 ↑↑↑↑↑↑↑↑↑↑`
    )
  );
};

export default verify;
