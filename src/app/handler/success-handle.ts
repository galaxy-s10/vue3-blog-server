import { ParameterizedContext } from 'koa';

import { chalkSUCCESS } from '../../utils/chalkTip';

import { HttpSuccessMsg } from '@/constant';

const successHandler = ({
  code = 200,
  ctx,
  data,
  message,
}: {
  code?: number;
  ctx: ParameterizedContext;
  data?: any;
  message?: string;
}) => {
  console.log(chalkSUCCESS(`👇👇👇👇 success-handle 👇👇👇👇`));
  const status = 200;
  const methods = ctx.request.method;

  ctx.status = status; // 不手动设置状态的话，默认是404，delete方法返回400
  ctx.body = {
    code,
    data,
    message: message || HttpSuccessMsg[methods],
  };

  console.log(chalkSUCCESS(`👆👆👆👆 success-handle 👆👆👆👆`));
};

export default successHandler;
