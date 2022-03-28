import { ParameterizedContext } from 'koa';

import { authJwt } from '../auth/authJwt';
import { chalkERROR, chalk } from '../chalkTip';

import logService from '@/service/log.service';

const errorHandler = (
  err: { code: number; error?: any; message?: string },
  ctx: ParameterizedContext
) => {
  const { code, error, message } = err;
  console.log(
    chalkERROR(
      `↓↓↓↓↓↓↓↓↓↓ 开始接收 ${ctx.request.method} ${ctx.request.url} 错误 ↓↓↓↓↓↓↓↓↓↓`
    )
  );
  const env = process.env.REACT_BLOG_SERVER_ENV;

  if (!code) {
    console.log(chalkERROR(`系统未知错误(不是通过手动调用emitError触发的)`));
    console.log(err);
    ctx.status = 400;
    ctx.body = {
      code: 400,
      error: err,
      message: '系统未知错误(不是通过手动调用emitError触发的)',
    };
  } else {
    // 如果捕获的错误有ctx，代表是接口地址报错
    console.log(chalk.redBright('code:'), code);
    console.log(chalk.redBright('query:'), { ...ctx.request.query });
    console.log(chalk.redBright('body:'), ctx.request.body);
    console.log(chalk.redBright('error:'), error);
    console.log(chalk.redBright('stack:'), error?.stack);
    console.log(chalk.redBright('message:'), message);

    let status;
    let defaultMessage;
    console.log(env, 333333);
    switch (code) {
      case 400:
        status = 400;
        defaultMessage = '参数错误!';
        break;
      case 401:
        status = 401;
        defaultMessage = '未授权!';
        break;
      case 403:
        status = 403;
        defaultMessage = '权限不足!';
        break;
      default:
        status = 404;
        defaultMessage = '未找到!';
    }
    // 不手动设置状态的话，默认是404（delete方法返回400），因此，即使走到了error-handle，且ctx.body返回了数据
    // 但是没有手动设置status的话，一样返回不了数据，因为status状态码都返回404了。
    ctx.status = status;
    ctx.body = {
      code: status,
      error,
      stack: env === 'development' ? error?.stack : undefined,
      message: message || defaultMessage,
    };
    if (env !== 'development') {
      const isAdmin = ctx.req.url.indexOf('/admin/') !== -1;
      authJwt(ctx.request)
        .then((res) => {
          logService.create({
            user_id: res.userInfo?.id || -1,
            api_user_agent: ctx.request.headers['user-agent'],
            api_from: isAdmin ? 2 : 1,
            api_body: JSON.stringify(ctx.request.body || {}),
            api_query: JSON.stringify(ctx.query),
            api_ip: (ctx.request.headers['x-real-ip'] as string) || '127.0.0.1',
            api_method: ctx.request.method,
            api_hostname: ctx.request.hostname,
            api_path: ctx.request.path,
            api_err_msg: message || error?.toString(),
            api_err_stack: JSON.stringify(error?.stack),
          });
        })
        .catch((e) => {
          console.log('error-handle的authJwt错误', e);
        });
    }
  }
  console.log(
    chalkERROR(
      `↑↑↑↑↑↑↑↑↑↑ 接收 ${ctx.request.method} ${ctx.request.url} 错误完成 ↑↑↑↑↑↑↑↑↑↑`
    )
  );
};

export default errorHandler;
