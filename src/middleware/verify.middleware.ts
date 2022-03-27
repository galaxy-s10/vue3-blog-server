import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/authJwt';
import { chalkINFO } from '@/app/chalkTip';
import emitError from '@/app/handler/emit-error';

// 白名单内的接口不需要判断token
const frontendWhiteList = [
  '/init/role',
  '/init/auth',
  '/init/roleAuth',
  '/init/dayData',
  '/visitor_log/create', // 前台的这个接口是post的
  '/user/create', // 前台的这个接口是post的
  '/user/login', // 前台的这个接口是post的
  '/link/create', // 前台的这个接口是post的
  '/email/send', // 前台的这个接口是post的
];
const backendWhiteList = [
  '/admin/user/register', // 后台的这个接口是post的
  '/admin/user/login', // 后台的这个接口是post的
  '/admin/csrf/get', // 后台的这个接口是试探csrf的
  '/admin/email/send', // 后台的这个接口是post的
];

const verify = async (ctx: ParameterizedContext, next) => {
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
      await next(); // WARN:测试用，记得删
      return; // WARN:测试用，记得删
      if (backendWhiteList.indexOf(url) !== -1) {
        await next();
      } else {
        const { code, message } = await authJwt(ctx.req);
        if (code !== 200) {
          emitError({
            ctx,
            code,
            error: message,
            message,
          });
          return;
        }
        /**
         * 这里必须await next()，因为路由匹配肯定是先匹配这个app.use的，
         * 如果这里匹配完成后直接next()了，就会返回数据了（404），也就是不会
         * 继续走后面的匹配了！但是如果加了await，就会等待后面的继续匹配完！
         */
        await next();
      }
    }
    console.log(chalkINFO('当前请求的是前台接口'));
    if (ctx.request.method === 'GET' || frontendWhiteList.indexOf(url) !== -1) {
      console.log(1111);
      await next();
    } else {
      console.log(222);
      const { code, message } = await authJwt(ctx.req);
      if (code !== 200) {
        emitError({
          ctx,
          code,
          error: message,
          message,
        });
        return;
      }
      /**
       * 因为这个verify.middleware是最先执行的中间件路由，
       * 而且这个verify.middleware是异步的，因此如果需要等待异步执行完成才继续匹配后面的中间时，
       * 必须使用await next()，如果这里使用next()，就会返回数据了（404），也就是不会
       * 继续走后面的匹配了！但是如果加了await，就会等待后面的继续匹配完！
       */
      await next();
    }
  } catch (error) {
    // catch错误（不仅仅authJwt的错误，也包括了try里面的所有报错）返回给前端，但try里面的代码错误开发者尽量把握。
    emitError({
      ctx,
      code: error.code,
      error,
      message: error.message,
    });
    return;
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
