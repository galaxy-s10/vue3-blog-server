import { ParameterizedContext } from 'koa';

import { chalkERROR, chalk } from '../../utils/chalkTip';

import { HttpErrorMsg } from '@/constant';
import { CustomError } from '@/model/customError.model';
import { isAdmin } from '@/utils';

const errorHandler = (error, ctx: ParameterizedContext) => {
  const admin = isAdmin(ctx);
  const { path, method } = ctx.request;
  const time = new Date().toLocaleString();
  const ip = (ctx.request.headers['x-real-ip'] as string) || '127.0.0.1';
  // eslint-disable-next-line
  async function main() {
    if (!(error instanceof CustomError)) {
      console.log(chalkERROR(`不是自定义错误`));
      const defaultError = {
        code: 500,
        errorCode: 1000,
        error: error.message,
        message: '服务器错误！',
      };
      ctx.status = defaultError.code;
      ctx.body = {
        code: defaultError.errorCode,
        errorCode: defaultError.errorCode,
        error: defaultError.error,
        message: defaultError.message,
      };
      return;
    }

    console.log(
      chalkERROR(
        `👇👇👇👇 收到自定义错误，日期：${time}，ip：${ip}，${
          admin ? '后台接口' : '前台接口'
        } ${method} ${path} 👇👇👇👇`
      )
    );

    console.log(chalk.redBright('code:'), error.code);
    console.log(chalk.redBright('errorCode:'), error.errorCode);
    console.log(chalk.redBright('message:'), error.message);
    console.log(chalk.redBright('query:'), { ...ctx.request.query });
    console.log(chalk.redBright('params:'), ctx.params);
    console.log(chalk.redBright('body:'), ctx.request.body);
    console.log(chalk.redBright('token:'), ctx.request.headers.authorization);
    console.log(chalk.redBright('error:'), error);

    // 不手动设置状态的话，默认是404（delete方法返回400），因此，即使走到了error-handle，且ctx.body返回了数据
    // 但是没有手动设置status的话，一样返回不了数据，因为status状态码都返回404了。
    ctx.status = error.code;
    ctx.body = {
      code: error.errorCode,
      errorCode: error.errorCode,
      message: error?.message || HttpErrorMsg[error.code],
    };

    console.log(
      chalkERROR(
        `👆👆👆👆 收到自定义错误，日期：${time}，ip：${ip}，${
          admin ? '后台接口' : '前台接口'
        } ${method} ${path} 👆👆👆👆`
      )
    );
  }

  main();
};

export default errorHandler;
