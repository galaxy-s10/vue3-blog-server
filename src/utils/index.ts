import { Context } from 'koa';

/** 发射错误 */
export const emitError = ({
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
  console.log('发射错误');
  // console.log(ctx, code, error, message);
  return ctx.app.emit('error', { ctx, code, error, message });
};
