import { ParameterizedContext } from 'koa';

import emitError from '@/app/handler/emit-error';
import { PROJECT_ENV } from '@/constant';

export const verifyEnv = async (ctx: ParameterizedContext, next) => {
  try {
    if (PROJECT_ENV === 'beta') {
      emitError({
        ctx,
        code: 400,
        message: '测试环境不能操作七牛云模块~',
      });
    } else {
      await next();
    }
  } catch (error) {
    emitError({ ctx, code: 400, error });
  }
};
