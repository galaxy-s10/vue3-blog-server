import { ParameterizedContext } from 'koa';

import { chalkWRAN } from '../chalkTip';

/** 发射错误 */
const emitError = ({
  ctx,
  code,
  error,
  message,
}: {
  ctx: ParameterizedContext;
  code: number;
  error: any;
  message?: string;
}) => {
  console.log(chalkWRAN('发射错误'));
  ctx.app.emit('error', { code, error, message }, ctx);
};

export default emitError;
