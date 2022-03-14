import { Context } from 'koa';

/** 发射错误 */
const emitError = ({
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
  return ctx.app.emit('error', { ctx, code, error, message });
};

export default emitError;
