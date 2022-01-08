import { Context } from 'koa';
import { _ERROR, _chalk } from '../chalkTip';

const errorHandler = function ({
  ctx,
  code,
  error,
  message,
}: {
  ctx: Context;
  code: number;
  error: any;
  message?: string;
}) {
  console.log(_ERROR('↓↓↓↓↓↓↓↓↓↓ 开始接收错误 ↓↓↓↓↓↓↓↓↓↓'));
  if (ctx) {
    // 如果捕获的错误有ctx，代表是接口地址报错
    console.log(_chalk.redBright(`url: ${ctx.request.url}`));
    console.log(_chalk.redBright(`code: ${code}`));
    console.log(_chalk.redBright(`error: ${error}`));
    console.log(_chalk.redBright(`message: ${message}`));

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
      message: message || defaultMessage,
    };
  } else {
    console.log(_ERROR('未知报错：'));
    console.log(arguments);
  }
  console.log(_ERROR('↑↑↑↑↑↑↑↑↑↑ 接收错误完成 ↑↑↑↑↑↑↑↑↑↑'));
};

export default errorHandler;
