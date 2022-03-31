import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import { chalkINFO } from '@/app/chalkTip';
import emitError from '@/app/handler/emit-error';

// 白名单内的接口不需要判断token
const frontendWhiteList = [
  '/init/role',
  '/init/auth',
  '/init/roleAuth',
  '/init/dayData',
  '/visitor_log/create', // 访客记录，这个接口是post的
  '/user/login', // 登录，这个接口是post的
  '/link/create', // 申请友链，这个接口是post的
  '/email/send', // 发送邮件，这个接口是post的
];
const backendWhiteList = [
  '/admin/user/register', // 后台的这个接口是post的
  '/admin/user/login', // 后台的这个接口是post的
  '/admin/user/code_login', // 验证码登录
  '/admin/github_user/login', // github登录
  '/admin/qq_user/login', // 登录接口
  '/admin/email/send', // 后台的这个接口是post的
  '/admin/other/send_email', // 发送邮件
];

const verify = async (ctx: ParameterizedContext, next) => {
  const url = ctx.request.path;
  const isAdmin = ctx.req.url.indexOf('/admin/') !== -1;

  console.log(
    chalkINFO(
      `↓↓↓↓↓↓↓↓↓↓ ${new Date().toLocaleString()} 监听${
        isAdmin ? '后' : '前'
      }台 ${ctx.request.method} ${url} 开始 ↓↓↓↓↓↓↓↓↓↓`
    )
  );

  const end = () => {
    console.log(
      chalkINFO(
        `↑↑↑↑↑↑↑↑↑↑ ${new Date().toLocaleString()} 监听${
          isAdmin ? '后' : '前'
        }台 ${ctx.request.method} ${url} 结束 ↑↑↑↑↑↑↑↑↑↑`
      )
    );
  };

  try {
    if (isAdmin) {
      if (backendWhiteList.indexOf(url) !== -1) {
        await next();
        end();
        return;
      }
      const { code, message } = await authJwt(ctx.req);
      if (code !== 200) {
        emitError({
          ctx,
          code,
          message,
        });
        end();
        return;
      }
      /**
       * 这里必须await next()，因为路由匹配肯定是先匹配这个app.use的，
       * 如果这里匹配完成后直接next()了，就会返回数据了（404），也就是不会
       * 继续走后面的匹配了！但是如果加了await，就会等待后面的继续匹配完！
       */
      await next();
      end();
      return;
    }
    // 前端的get接口都不需要判断token，白名单内的也不需要判断token（如注册登录这些接口是post的）
    if (ctx.request.method === 'GET' || frontendWhiteList.indexOf(url) !== -1) {
      await next();
      end();
      return;
    }
    const { code, message } = await authJwt(ctx.req);
    if (code !== 200) {
      emitError({
        ctx,
        code,
        message,
      });
      end();
      return;
    }
    /**
     * 因为这个verify.middleware是最先执行的中间件路由，
     * 而且这个verify.middleware是异步的，因此如果需要等待异步执行完成才继续匹配后面的中间时，
     * 必须使用await next()，如果这里使用next()，就会返回数据了（404），也就是不会
     * 继续走后面的匹配了！但是如果加了await，就会等待后面的继续匹配完！
     */
    await next();
    end();
    return;
  } catch (error) {
    emitError({
      ctx,
      code: error.code,
      message: error.message,
    });
    end();
  }
};

export default verify;
