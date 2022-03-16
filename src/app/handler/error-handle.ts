import path from 'path';

import { Context } from 'koa';

import { authJwt } from '../authJwt';
import { chalkERROR, chalk } from '../chalkTip';
// import logService from '@/service/log.service';

const errorHandler = ({
  ctx,
  code,
  error,
  message,
}: {
  ctx: Context;
  code: number;
  error: any;
  message?: string;
}) => {
  if (ctx) {
    console.log(
      chalkERROR(
        `↓↓↓↓↓↓↓↓↓↓ 开始接收 ${ctx.request.method} ${ctx.request.url} 错误 ↓↓↓↓↓↓↓↓↓↓`
      )
    );
    // 如果捕获的错误有ctx，代表是接口地址报错
    console.log(chalk.redBright(`code: ${code}`));
    console.log(chalk.redBright(`params:`), ctx.params);
    console.log(chalk.redBright(`body:`), ctx.request.body);
    console.log(chalk.redBright(`error: ${error}`));
    console.log(chalk.redBright(`stack: ${error.stack}`));
    console.log(chalk.redBright(`message: ${message}`));

    let status;
    let defaultMessage;

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
    ctx.status = status;
    ctx.body = {
      code: status,
      error: { message: error?.message || null, error },
      stack: error.stack,
      message: message || defaultMessage,
    };
    const isAdmin = ctx.req.url.indexOf('/admin/') !== -1;

    authJwt(ctx.request).then((res) => {
      // eslint-disable-next-line
      const logService = require(path.resolve(
        __dirname,
        `../../service/log.service.ts`
      )).default;
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
        api_err_msg: message || error.toString(),
        api_err_stack: JSON.stringify(error.stack),
      });
    });

    console.log(
      chalkERROR(
        `↑↑↑↑↑↑↑↑↑↑ 接收 ${ctx.request.method} ${ctx.request.url} 错误完成 ↑↑↑↑↑↑↑↑↑↑`
      )
    );
  } else {
    console.log(chalkERROR(`↓↓↓↓↓↓↓↓↓↓ 接收到未知报错 ↓↓↓↓↓↓↓↓↓↓`));
    console.log(arguments);
    console.log(chalkERROR(`↑↑↑↑↑↑↑↑↑↑ 接收到未知报错 ↑↑↑↑↑↑↑↑↑↑`));
  }
};

export default errorHandler;
