import { ParameterizedContext } from 'koa';

import { PROJECT_ENV } from '@/constant';
import { CustomError } from '@/model/customError.model';

export const verifyEnv = async (ctx: ParameterizedContext, next) => {
  if (PROJECT_ENV === 'beta') {
    throw new CustomError(`测试环境不能操作七牛云模块！`, 403, 403);
  } else {
    await next();
  }
};
