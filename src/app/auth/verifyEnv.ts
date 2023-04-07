import { ParameterizedContext } from 'koa';

import { ALLOW_HTTP_CODE, PROJECT_ENV, PROJECT_ENV_ENUM } from '@/constant';
import { CustomError } from '@/model/customError.model';

export const betaError = async (ctx: ParameterizedContext, next) => {
  if (PROJECT_ENV === PROJECT_ENV_ENUM.beta) {
    throw new CustomError(
      `beta环境不允许操作${ctx.path}`,
      ALLOW_HTTP_CODE.forbidden,
      ALLOW_HTTP_CODE.forbidden
    );
  } else {
    await next();
  }
};
