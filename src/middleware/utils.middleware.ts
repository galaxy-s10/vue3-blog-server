import { ParameterizedContext } from 'koa';

import { authJwt } from '@/app/auth/authJwt';
import { ALLOW_HTTP_CODE } from '@/constant';
import { CustomError } from '@/model/customError.model';

export const verifyIdOne = async (ctx: ParameterizedContext, next) => {
  const { code, userInfo, message } = await authJwt(ctx);
  if (code !== ALLOW_HTTP_CODE.ok) {
    throw new CustomError(message, code, code);
  }
  if (userInfo!.id !== 1) {
    throw new CustomError(
      `只允许id=1的用户操作！`,
      ALLOW_HTTP_CODE.forbidden,
      ALLOW_HTTP_CODE.forbidden
    );
  } else {
    await next();
  }
};
